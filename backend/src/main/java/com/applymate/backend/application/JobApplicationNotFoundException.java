package com.applymate.backend.application;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class JobApplicationNotFoundException
        extends RuntimeException {

    public JobApplicationNotFoundException() {
        super("Job application was not found");
    }
}