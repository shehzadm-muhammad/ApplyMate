package com.applymate.backend.system;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class SystemController {

    @GetMapping("/status")
    public ApiStatusResponse getStatus() {
        return new ApiStatusResponse(
                "ApplyMate API",
                "1.0.0",
                "UP"
        );
    }
}