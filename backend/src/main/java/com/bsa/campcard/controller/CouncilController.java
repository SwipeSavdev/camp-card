package com.bsa.campcard.controller;

import com.bsa.campcard.entity.Council;
import com.bsa.campcard.entity.Council.CouncilStatus;
import com.bsa.campcard.service.CouncilService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/councils")
@RequiredArgsConstructor
public class CouncilController {
    
    private final CouncilService councilService;
    
    @PostMapping
    public ResponseEntity<?> createCouncil(@RequestBody Council council) {
        try {
            log.info("Creating council: {}", council.getName());
            Council createdCouncil = councilService.createCouncil(council);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdCouncil);
        } catch (IllegalArgumentException e) {
            log.error("Error creating council: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error creating council", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create council"));
        }
    }
    
    @GetMapping
    public ResponseEntity<?> getAllCouncils(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String search) {
        
        try {
            Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<Council> councils;
            
            if (search != null && !search.trim().isEmpty()) {
                councils = councilService.searchCouncils(search, pageable);
            } else if (status != null && region != null) {
                councils = councilService.getCouncilsByStatus(CouncilStatus.valueOf(status.toUpperCase()), pageable);
            } else if (status != null) {
                councils = councilService.getCouncilsByStatus(CouncilStatus.valueOf(status.toUpperCase()), pageable);
            } else if (region != null) {
                councils = councilService.getCouncilsByRegion(region, pageable);
            } else {
                councils = councilService.getAllCouncils(pageable);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", councils.getContent());
            response.put("currentPage", councils.getNumber());
            response.put("totalItems", councils.getTotalElements());
            response.put("totalPages", councils.getTotalPages());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching councils", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch councils"));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getCouncilById(@PathVariable Long id) {
        try {
            return councilService.getCouncilById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error fetching council {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch council"));
        }
    }
    
    @GetMapping("/uuid/{uuid}")
    public ResponseEntity<?> getCouncilByUuid(@PathVariable UUID uuid) {
        try {
            return councilService.getCouncilByUuid(uuid)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error fetching council by UUID {}", uuid, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch council"));
        }
    }
    
    @GetMapping("/number/{councilNumber}")
    public ResponseEntity<?> getCouncilByCouncilNumber(@PathVariable String councilNumber) {
        try {
            return councilService.getCouncilByCouncilNumber(councilNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error fetching council by number {}", councilNumber, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch council"));
        }
    }
    
    @GetMapping("/state/{state}")
    public ResponseEntity<?> getCouncilsByState(@PathVariable String state) {
        try {
            List<Council> councils = councilService.getCouncilsByState(state);
            return ResponseEntity.ok(councils);
        } catch (Exception e) {
            log.error("Error fetching councils by state {}", state, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch councils by state"));
        }
    }
    
    @GetMapping("/top-performers")
    public ResponseEntity<?> getTopPerformingCouncils(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Council> councils = councilService.getTopPerformingCouncils(pageable);
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", councils.getContent());
            response.put("currentPage", councils.getNumber());
            response.put("totalItems", councils.getTotalElements());
            response.put("totalPages", councils.getTotalPages());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching top performing councils", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch top performing councils"));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCouncil(@PathVariable Long id, @RequestBody Council council) {
        try {
            Council updatedCouncil = councilService.updateCouncil(id, council);
            return ResponseEntity.ok(updatedCouncil);
        } catch (IllegalArgumentException e) {
            log.error("Error updating council {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error updating council {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update council"));
        }
    }
    
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateCouncilStatus(
            @PathVariable Long id,
            @RequestParam CouncilStatus status) {
        
        try {
            Council updatedCouncil = councilService.updateCouncilStatus(id, status);
            return ResponseEntity.ok(updatedCouncil);
        } catch (IllegalArgumentException e) {
            log.error("Error updating council {} status: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error updating council {} status", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update council status"));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCouncil(@PathVariable Long id) {
        try {
            councilService.deleteCouncil(id);
            return ResponseEntity.ok(Map.of("message", "Council deleted successfully"));
        } catch (IllegalArgumentException e) {
            log.error("Error deleting council {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error deleting council {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to delete council"));
        }
    }
}
