package com.smc.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    public String storeFile(MultipartFile file) {
        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || !StringUtils.hasText(originalFilename)) {
                throw new IllegalArgumentException("File name must not be empty");
            }

            String originalFileName = StringUtils.cleanPath(originalFilename);
            int extensionIndex = originalFileName.lastIndexOf(".");
            String fileExtension = extensionIndex >= 0
                    ? originalFileName.substring(extensionIndex)
                    : "";
            String newFileName = UUID.randomUUID().toString() + fileExtension;

            Path targetLocation = uploadPath.resolve(newFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Returns the URL path (e.g., /uploads/uuid.jpg)
            return "/uploads/" + newFileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file. Please try again!", ex);
        }
    }
}