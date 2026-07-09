package com.sih.portal.dto;

import com.sih.portal.entity.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private String id;
    private String name;
    private String email;
    private String phone;
    private UserRole role;
    private String department;
    private String district;
    private String state;
    private String avatar;
}
