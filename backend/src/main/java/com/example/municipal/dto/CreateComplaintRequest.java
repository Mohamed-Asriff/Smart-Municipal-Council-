package com.example.municipal.dto;

import com.example.municipal.enums.Category;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateComplaintRequest(
        @NotBlank @Size(max = 150) String title,
        @NotNull Category category,
        @NotBlank String description,
        @NotBlank String location,
        Double latitude,
        Double longitude) {}