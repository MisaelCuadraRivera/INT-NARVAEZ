package com.hospital.security;

import com.hospital.model.User;
import com.hospital.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    
    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));
        
        logger.info("Loading user: {} with role: {}", username, user.getRole());
        Collection<? extends GrantedAuthority> authorities = getAuthorities(user);
        logger.info("User {} has authorities: {}", username, authorities);
        
        return org.springframework.security.core.userdetails.User.builder()
            .username(user.getUsername())
            .password(user.getPassword())
            .authorities(authorities)
            .build();
    }
    
    private Collection<? extends GrantedAuthority> getAuthorities(User user) {
        String role = "ROLE_" + user.getRole().name();
        logger.info("Creating authority for user {}: {}", user.getUsername(), role);
        return Collections.singletonList(new SimpleGrantedAuthority(role));
    }
}

