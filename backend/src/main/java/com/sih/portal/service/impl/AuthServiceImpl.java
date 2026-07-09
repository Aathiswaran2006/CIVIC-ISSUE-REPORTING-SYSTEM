package com.sih.portal.service.impl;

import com.sih.portal.dto.LoginRequest;
import com.sih.portal.dto.LoginResponse;
import com.sih.portal.dto.RegisterRequest;
import com.sih.portal.dto.ResetPasswordRequest;
import com.sih.portal.entity.*;
import com.sih.portal.exception.BadRequestException;
import com.sih.portal.exception.UnauthorizedException;
import com.sih.portal.mapper.PortalMapper;
import com.sih.portal.repository.*;
import com.sih.portal.security.JwtTokenProvider;
import com.sih.portal.service.AuditLogService;
import com.sih.portal.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final CitizenRepository citizenRepository;
    private final AuthorityRepository authorityRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final PortalMapper portalMapper;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public LoginResponse login(LoginRequest request) {
        UserRole role = request.getRole();
        String userId = null;
        String userName = null;
        String userEmail = null;
        String userPhone = null;
        String userDepartment = null;
        String userState = null;
        String userDistrict = null;
        String userAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";

        if (role == UserRole.CITIZEN) {
            Citizen citizen = citizenRepository.findByEmailIgnoreCase(request.getEmail())
                    .orElseThrow(() -> new UnauthorizedException("Citizen not found with this email"));

            if (!passwordEncoder.matches(request.getPassword(), citizen.getPassword())) {
                throw new UnauthorizedException("Invalid password");
            }
            userId = citizen.getId();
            userName = citizen.getName();
            userEmail = citizen.getEmail();
            userPhone = citizen.getPhone();
            userState = citizen.getState();
            userDistrict = citizen.getDistrict();
            userAvatar = citizen.getAvatar();

        } else if (role == UserRole.AUTHORITY) {
            String pinCode = request.getPinCode();
            if (pinCode == null || pinCode.trim().isEmpty()) {
                throw new BadRequestException("Area PIN Code is required");
            }
            String expectedPassword = "tn(" + pinCode + ")";
            if (!request.getPassword().equals(expectedPassword)) {
                throw new UnauthorizedException("Invalid password. Password format must be tn(<PINCODE>)");
            }

            Authority authority = authorityRepository.findByPinCode(pinCode)
                    .orElseGet(() -> {
                        Authority newAuth = Authority.builder()
                                .id("auth-" + pinCode)
                                .name(request.getName() != null && !request.getName().trim().isEmpty() ? request.getName() : "Municipal Authority " + pinCode)
                                .pinCode(pinCode)
                                .password(passwordEncoder.encode(expectedPassword))
                                .build();
                        return authorityRepository.save(newAuth);
                    });

            userId = authority.getId();
            userName = authority.getName();
            userEmail = "authority_" + pinCode + "@portal.gov.in";
            userPhone = "";
            userDepartment = "Municipal Administration";
            userState = "";
            userDistrict = "Area " + pinCode;

        } else if (role == UserRole.ADMIN) {
            String name = request.getName();
            if (name == null || name.trim().isEmpty()) {
                throw new BadRequestException("Administrator Name is required");
            }

            Admin admin = adminRepository.findByName(name)
                    .orElseGet(() -> {
                        Admin newAdmin = Admin.builder()
                                .id("admin-" + System.currentTimeMillis())
                                .name(name)
                                .password(passwordEncoder.encode("7102006"))
                                .build();
                        return adminRepository.save(newAdmin);
                    });

            if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
                throw new UnauthorizedException("Invalid administrator password");
            }

            userId = admin.getId();
            userName = admin.getName();
            userEmail = "admin_" + name.toLowerCase().replace(" ", "_") + "@portal.gov.in";
            userPhone = "";
            userDepartment = "All Departments";
            userState = "National";
            userDistrict = "Central";
        }

        User user = User.builder()
                .id(userId)
                .name(userName)
                .email(userEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .phone(userPhone)
                .department(userDepartment)
                .state(userState)
                .district(userDistrict)
                .avatar(userAvatar)
                .build();

        userRepository.save(user);

        String token = tokenProvider.generateToken(user);

        auditLogService.log("USER_LOGIN", user.getId(), user.getName(),
                "Logged in successfully as " + user.getRole());

        return LoginResponse.builder()
                .token(token)
                .user(portalMapper.toUserDto(user))
                .build();
    }

    @Override
    @Transactional
    public LoginResponse register(RegisterRequest request) {
        if (request.getRole() == UserRole.CITIZEN) {
            if (citizenRepository.existsByEmailIgnoreCase(request.getEmail())) {
                throw new BadRequestException("Email already registered");
            }

            String citizenId = "c-" + System.currentTimeMillis();
            Citizen newCitizen = Citizen.builder()
                    .id(citizenId)
                    .name(request.getName())
                    .email(request.getEmail().toLowerCase())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .phone(request.getPhone())
                    .state(request.getState())
                    .district(request.getDistrict())
                    .avatar("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150")
                    .build();

            citizenRepository.save(newCitizen);

            User user = User.builder()
                    .id(citizenId)
                    .name(newCitizen.getName())
                    .email(newCitizen.getEmail())
                    .password(newCitizen.getPassword())
                    .role(UserRole.CITIZEN)
                    .phone(newCitizen.getPhone())
                    .state(newCitizen.getState())
                    .district(newCitizen.getDistrict())
                    .avatar(newCitizen.getAvatar())
                    .build();

            userRepository.save(user);

            auditLogService.log("USER_REGISTER", citizenId, newCitizen.getName(),
                    "Registered as new Citizen");

            String token = tokenProvider.generateToken(user);

            return LoginResponse.builder()
                    .token(token)
                    .user(portalMapper.toUserDto(user))
                    .build();
        } else {
            throw new BadRequestException("Registration is only supported for Citizens");
        }
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        Citizen citizen = citizenRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Citizen not found with this email"));

        citizen.setPassword(passwordEncoder.encode(request.getNewPassword()));
        citizenRepository.save(citizen);

        User user = userRepository.findByEmailIgnoreCase(request.getEmail()).orElse(null);
        if (user != null) {
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);
        }

        auditLogService.log("PASSWORD_RESET", citizen.getId(), citizen.getName(),
                "Reset password successfully");
    }
}
