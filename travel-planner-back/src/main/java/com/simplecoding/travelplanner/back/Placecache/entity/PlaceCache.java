package com.simplecoding.travelplanner.back.Placecache.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "PLACE_CACHE")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaceCache {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "place_cache_seq")
    @SequenceGenerator(name = "place_cache_seq", sequenceName = "PLACE_CACHE_SEQ", allocationSize = 1)
    @Column(name = "CACHE_ID")
    private Long cacheId;

    @Column(name = "PLACE_NAME", nullable = false, length = 100)
    private String placeName;

    @Column(name = "KAKAO_PLACE_ID", nullable = false, unique = true, length = 50)
    private String kakaoPlaceId;

    @Column(name = "ADDRESS", length = 200)
    private String address;

    @Column(name = "LATITUDE")
    private Double latitude;

    @Column(name = "LONGITUDE")
    private Double longitude;

    @Column(name = "CATEGORY", length = 255)
    private String category;

    @CreationTimestamp
    @Column(name = "CACHED_AT", updatable = false)
    private LocalDateTime cachedAt;
}
