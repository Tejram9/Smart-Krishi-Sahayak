package com.smartkrishisahayak.controller;

import com.smartkrishisahayak.dto.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminTestController {

    @GetMapping("/test")
    public ResponseEntity<ApiResponse<String>> testAdminAccess() {
        return ResponseEntity.ok(ApiResponse.success("Admin authorization successful.", "ADMIN_ACCESS_GRANTED"));
    }
}
