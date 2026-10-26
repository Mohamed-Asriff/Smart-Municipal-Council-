package com.smc.repository;

import com.smc.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);
    Optional<User> findByUsernameIgnoreCase(String username);
    Optional<User> findByPhoneNormalized(String phoneNormalized);
    Optional<User> findByResetToken(String resetToken);

    boolean existsByEmail(String email);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByUsernameIgnoreCase(String username);
    boolean existsByPhoneNormalized(String phoneNormalized);
    boolean existsByNic(String nic);

    // Citizen lookup by any identifier (used by issueNewBill)
    Optional<User> findByNicIgnoreCase(String nic);
    Optional<User> findByUserCodeIgnoreCase(String userCode);
    Optional<User> findByAssessmentNoIgnoreCase(String assessmentNo);
}
