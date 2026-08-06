package com.smartkrishisahayak.controller;

import com.smartkrishisahayak.dto.response.ApiResponse;
import com.smartkrishisahayak.dto.response.HealthResponse;
import com.smartkrishisahayak.util.AppConstants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.util.Arrays;

@RestController
@RequestMapping("/api/v1")
public class HealthController {

    private final DataSource dataSource;

    @Autowired
    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<HealthResponse>> checkHealth() {
        String dbStatus = "UNKNOWN";
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            dbStatus = "CONNECTED (" + metaData.getDatabaseProductName() + " " + metaData.getDatabaseProductVersion() + ")";
        } catch (Exception e) {
            dbStatus = "DISCONNECTED: " + e.getMessage();
        }

        HealthResponse healthResponse = new HealthResponse(
                "UP",
                AppConstants.APP_NAME,
                AppConstants.APP_VERSION,
                dbStatus,
                Arrays.asList(AppConstants.LANG_MARATHI, AppConstants.LANG_HINDI, AppConstants.LANG_ENGLISH)
        );

        return ResponseEntity.ok(ApiResponse.success(AppConstants.MSG_HEALTH_OK, healthResponse));
    }
}
