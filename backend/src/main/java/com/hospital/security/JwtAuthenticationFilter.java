package com.hospital.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    
    @Autowired
    private JwtTokenProvider tokenProvider;
    
    @Autowired
    private UserDetailsService userDetailsService;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        // No procesar JWT para endpoints públicos
        String path = request.getRequestURI();
        if (path.startsWith("/api/auth/") || path.startsWith("/h2-console/") || path.startsWith("/api/qr/")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        try {
            String jwt = getJwtFromRequest(request);
            
            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                String username = tokenProvider.getUsernameFromToken(jwt);
                logger.info("Validating JWT for user: " + username + " on path: " + request.getRequestURI());
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                logger.info("User " + username + " loaded with authorities: " + userDetails.getAuthorities());
                
                // Verificar que las autoridades estén correctamente cargadas
                if (userDetails.getAuthorities().isEmpty()) {
                    logger.error("User " + username + " has no authorities!");
                }
                
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
                
                // Verificar que la autenticación se estableció correctamente
                if (SecurityContextHolder.getContext().getAuthentication() != null) {
                    logger.info("Authentication set successfully. User: " + username + 
                              ", Authorities: " + SecurityContextHolder.getContext().getAuthentication().getAuthorities());
                } else {
                    logger.error("Failed to set authentication in SecurityContext!");
                }
            } else if (StringUtils.hasText(jwt)) {
                logger.warn("JWT token is invalid or expired for request: " + request.getRequestURI());
            } else {
                logger.warn("No JWT token found in request: " + request.getRequestURI());
            }
        } catch (Exception ex) {
            logger.error("Could not set user authentication in security context for request: " + request.getRequestURI(), ex);
            // No bloquear la petición, dejar que Spring Security maneje la autorización
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}

