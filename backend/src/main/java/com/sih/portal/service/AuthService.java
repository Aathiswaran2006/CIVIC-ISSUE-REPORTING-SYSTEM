package com.sih.portal.service;

import com.sih.portal.dto.LoginRequest;
import com.sih.portal.dto.LoginResponse;
import com.sih.portal.dto.RegisterRequest;
import com.sih.portal.dto.ResetPasswordRequest;

public interface AuthService {
    LoginResponse login(LoginRequest request);
    LoginResponse register(RegisterRequest request);
    void resetPassword(ResetPasswordRequest request);
}
