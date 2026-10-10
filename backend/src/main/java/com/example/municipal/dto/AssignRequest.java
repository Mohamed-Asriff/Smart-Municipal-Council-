package com.example.municipal.dto;

import com.example.municipal.enums.Department;
import com.example.municipal.enums.Priority;
import jakarta.validation.constraints.NotNull;

public record AssignRequest(@NotNull Department department, Priority priority) {}