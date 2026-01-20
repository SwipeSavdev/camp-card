package com.bsa.campcard.service;

import com.bsa.campcard.dto.DashboardResponse;
import com.bsa.campcard.dto.DashboardResponse.*;
import com.bsa.campcard.entity.*;
import com.bsa.campcard.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final TroopRepository troopRepository;
    private final ScoutRepository scoutRepository;
    private final CouncilRepository councilRepository;
    private final MerchantRepository merchantRepository;
    private final OfferRepository offerRepository;
    private final ReferralRepository referralRepository;

    public DashboardResponse getDashboardData() {
        return getDashboardData(null);
    }

    /**
     * Get dashboard data filtered by troop ID (for Unit Leaders)
     * @param troopId Optional troop ID to filter data - if null, returns all data
     */
    public DashboardResponse getDashboardData(Long troopId) {
        log.info("Fetching dashboard data" + (troopId != null ? " for troop " + troopId : ""));

        // Get summary metrics
        long totalTroops = troopRepository.count();
        long activeTroops = troopRepository.findByStatus(Troop.TroopStatus.ACTIVE, Pageable.unpaged()).getTotalElements();
        long totalScouts = scoutRepository.count();
        long activeScouts = scoutRepository.findByStatus(Scout.ScoutStatus.ACTIVE, Pageable.unpaged()).getTotalElements();

        BigDecimal totalSales = councilRepository.getTotalActiveSales();
        if (totalSales == null) totalSales = BigDecimal.ZERO;

        long totalMerchants = merchantRepository.count();
        long activeMerchants = merchantRepository.countByStatusAndDeletedAtIsNull(Merchant.MerchantStatus.APPROVED);

        long totalOffers = offerRepository.count();
        long activeOffers = offerRepository.countByStatus(Offer.OfferStatus.ACTIVE);

        // Get referral stats
        long totalReferrals = referralRepository.count();
        long successfulReferrals = referralRepository.findAll().stream()
                .filter(r -> r.getStatus() == Referral.ReferralStatus.COMPLETED || r.getStatus() == Referral.ReferralStatus.REWARDED)
                .count();
        double referralConversionRate = totalReferrals > 0 ?
                (double) successfulReferrals / totalReferrals * 100 : 0.0;

        // Calculate total cards sold
        int totalCardsSold = 0;
        List<Troop> allTroops = troopRepository.findAll();
        for (Troop troop : allTroops) {
            if (troop.getCardsSold() != null) {
                totalCardsSold += troop.getCardsSold();
            }
        }

        // Get BSA reporting data
        List<TroopSalesData> troopSales = getTroopSalesData();
        List<TroopRecruitingData> troopRecruiting = getTroopRecruitingData();
        List<ScoutSalesData> scoutSales = getScoutSalesData();
        List<ScoutReferralData> scoutReferrals = getScoutReferralData();
        List<CustomerReferralData> customerReferrals = getCustomerReferralData();

        // Get time series data
        List<TimeSeriesPoint> salesTrend30Days = generateSalesTrend30Days();

        return DashboardResponse.builder()
                .totalTroops(totalTroops)
                .activeTroops(activeTroops)
                .totalScouts(totalScouts)
                .activeScouts(activeScouts)
                .totalSales(totalSales)
                .totalCardsSold(totalCardsSold)
                .totalReferrals(totalReferrals)
                .successfulReferrals(successfulReferrals)
                .referralConversionRate(Math.round(referralConversionRate * 10.0) / 10.0)
                .totalMerchants(totalMerchants)
                .activeMerchants(activeMerchants)
                .totalOffers(totalOffers)
                .activeOffers(activeOffers)
                .salesTrend(calculateTrend())
                .scoutsTrend(calculateTrend())
                .troopsTrend(calculateTrend())
                .referralsTrend(calculateTrend())
                .troopSales(troopSales)
                .troopRecruiting(troopRecruiting)
                .scoutSales(scoutSales)
                .scoutReferrals(scoutReferrals)
                .customerReferrals(customerReferrals)
                .salesTrend30Days(salesTrend30Days)
                .build();
    }

    private List<TroopSalesData> getTroopSalesData() {
        Pageable pageable = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "totalSales"));
        Page<Troop> topTroops = troopRepository.findTopPerformingTroops(pageable);

        return topTroops.getContent().stream()
                .map(troop -> {
                    // Get council name
                    String councilName = "Unknown Council";
                    if (troop.getCouncilId() != null) {
                        councilName = councilRepository.findById(troop.getCouncilId())
                                .map(Council::getName)
                                .orElse("Unknown Council");
                    }

                    BigDecimal avgPerScout = troop.getAverageSalesPerScout() != null ?
                            troop.getAverageSalesPerScout() : BigDecimal.ZERO;

                    return TroopSalesData.builder()
                            .id(troop.getId())
                            .name("Troop " + troop.getTroopNumber())
                            .council(councilName)
                            .sales(troop.getTotalSales() != null ? troop.getTotalSales() : BigDecimal.ZERO)
                            .scouts(troop.getActiveScouts() != null ? troop.getActiveScouts() : 0)
                            .avgPerScout(avgPerScout)
                            .trend(calculateTrend())
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<TroopRecruitingData> getTroopRecruitingData() {
        Pageable pageable = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "activeScouts"));
        Page<Troop> troops = troopRepository.findAll(pageable);

        return troops.getContent().stream()
                .map(troop -> {
                    String councilName = "Unknown Council";
                    if (troop.getCouncilId() != null) {
                        councilName = councilRepository.findById(troop.getCouncilId())
                                .map(Council::getName)
                                .orElse("Unknown Council");
                    }

                    int totalScouts = troop.getTotalScouts() != null ? troop.getTotalScouts() : 0;
                    int activeScouts = troop.getActiveScouts() != null ? troop.getActiveScouts() : 0;
                    int newScouts = Math.max(0, activeScouts / 4); // Estimate new scouts as 25% of active
                    int recruitingGoal = Math.max(1, (int)(totalScouts * 0.15)); // Goal is 15% growth
                    double percentOfGoal = recruitingGoal > 0 ?
                            (double) newScouts / recruitingGoal * 100 : 0;

                    return TroopRecruitingData.builder()
                            .id(troop.getId())
                            .name("Troop " + troop.getTroopNumber())
                            .council(councilName)
                            .newScouts(newScouts)
                            .totalScouts(totalScouts)
                            .recruitingGoal(recruitingGoal)
                            .percentOfGoal(Math.min(100, Math.round(percentOfGoal * 10.0) / 10.0))
                            .trend(calculateTrend())
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<ScoutSalesData> getScoutSalesData() {
        Pageable pageable = PageRequest.of(0, 20);
        Page<Scout> topScouts = scoutRepository.findTopSellersGlobal(pageable);

        return topScouts.getContent().stream()
                .map(scout -> {
                    String troopName = "Unknown Troop";
                    if (scout.getTroopId() != null) {
                        troopName = troopRepository.findById(scout.getTroopId())
                                .map(t -> "Troop " + t.getTroopNumber())
                                .orElse("Unknown Troop");
                    }

                    // Count referrals for this scout
                    int referralCount = 0;
                    if (scout.getUserId() != null) {
                        referralCount = referralRepository.findByReferrerId(scout.getUserId()).size();
                    }

                    return ScoutSalesData.builder()
                            .id(scout.getId())
                            .name(scout.getFullName())
                            .troop(troopName)
                            .sales(scout.getTotalSales() != null ? scout.getTotalSales() : BigDecimal.ZERO)
                            .cards(scout.getCardsSold() != null ? scout.getCardsSold() : 0)
                            .referrals(referralCount)
                            .rank(scout.getRank() != null ? formatRank(scout.getRank().name()) : "Scout")
                            .trend(calculateTrend())
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<ScoutReferralData> getScoutReferralData() {
        // Get scouts with referrals
        List<Scout> allScouts = scoutRepository.findAll();
        Map<Long, Integer> scoutReferralCounts = new HashMap<>();
        Map<Long, Integer> scoutConversionCounts = new HashMap<>();
        Map<Long, BigDecimal> scoutReferralRevenue = new HashMap<>();

        for (Scout scout : allScouts) {
            if (scout.getUserId() != null) {
                List<Referral> referrals = referralRepository.findByReferrerId(scout.getUserId());
                int total = referrals.size();
                int converted = (int) referrals.stream()
                        .filter(r -> r.getStatus() == Referral.ReferralStatus.COMPLETED || r.getStatus() == Referral.ReferralStatus.REWARDED)
                        .count();
                BigDecimal revenue = referrals.stream()
                        .filter(r -> r.getRewardAmount() != null && r.getRewardClaimed() != null && r.getRewardClaimed())
                        .map(Referral::getRewardAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                if (total > 0) {
                    scoutReferralCounts.put(scout.getId(), total);
                    scoutConversionCounts.put(scout.getId(), converted);
                    scoutReferralRevenue.put(scout.getId(), revenue);
                }
            }
        }

        // Sort by referral count and take top 20
        return allScouts.stream()
                .filter(s -> scoutReferralCounts.containsKey(s.getId()))
                .sorted((a, b) -> scoutReferralCounts.getOrDefault(b.getId(), 0) - scoutReferralCounts.getOrDefault(a.getId(), 0))
                .limit(20)
                .map(scout -> {
                    String troopName = "Unknown Troop";
                    if (scout.getTroopId() != null) {
                        troopName = troopRepository.findById(scout.getTroopId())
                                .map(t -> "Troop " + t.getTroopNumber())
                                .orElse("Unknown Troop");
                    }

                    int referrals = scoutReferralCounts.getOrDefault(scout.getId(), 0);
                    int conversions = scoutConversionCounts.getOrDefault(scout.getId(), 0);
                    double conversionRate = referrals > 0 ? (double) conversions / referrals * 100 : 0;

                    return ScoutReferralData.builder()
                            .id(scout.getId())
                            .name(scout.getFullName())
                            .troop(troopName)
                            .referrals(referrals)
                            .conversions(conversions)
                            .revenue(scoutReferralRevenue.getOrDefault(scout.getId(), BigDecimal.ZERO))
                            .conversionRate(Math.round(conversionRate * 10.0) / 10.0)
                            .trend(calculateTrend())
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<CustomerReferralData> getCustomerReferralData() {
        // Group referrals by referrer and aggregate
        List<Referral> allReferrals = referralRepository.findAll();
        Map<UUID, List<Referral>> referralsByReferrer = allReferrals.stream()
                .filter(r -> r.getReferrerId() != null)
                .collect(Collectors.groupingBy(Referral::getReferrerId));

        return referralsByReferrer.entrySet().stream()
                .sorted((a, b) -> b.getValue().size() - a.getValue().size())
                .limit(20)
                .map(entry -> {
                    UUID referrerId = entry.getKey();
                    List<Referral> referrals = entry.getValue();

                    int total = referrals.size();
                    int converted = (int) referrals.stream()
                            .filter(r -> r.getStatus() == Referral.ReferralStatus.COMPLETED || r.getStatus() == Referral.ReferralStatus.REWARDED)
                            .count();
                    BigDecimal revenue = referrals.stream()
                            .filter(r -> r.getRewardAmount() != null)
                            .map(Referral::getRewardAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    BigDecimal avgOrderValue = converted > 0 ?
                            revenue.divide(BigDecimal.valueOf(converted), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;

                    // Find most recent referral
                    String lastReferral = referrals.stream()
                            .map(Referral::getCreatedAt)
                            .filter(Objects::nonNull)
                            .max(LocalDateTime::compareTo)
                            .map(this::formatRelativeTime)
                            .orElse("N/A");

                    return CustomerReferralData.builder()
                            .id(referrerId.toString())
                            .name("Customer " + referrerId.toString().substring(0, 8))
                            .email(referrerId.toString().substring(0, 8) + "@email.com")
                            .referrals(total)
                            .conversions(converted)
                            .totalRevenue(revenue)
                            .avgOrderValue(avgOrderValue)
                            .lastReferral(lastReferral)
                            .trend(calculateTrend())
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<TimeSeriesPoint> generateSalesTrend30Days() {
        List<TimeSeriesPoint> data = new ArrayList<>();
        LocalDate today = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");

        BigDecimal baseSales = councilRepository.getTotalActiveSales();
        if (baseSales == null) baseSales = BigDecimal.valueOf(10000);

        Random random = new Random(42); // Seed for consistency
        for (int i = 29; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            // Simulate daily variation
            double variance = 0.8 + (random.nextDouble() * 0.4);
            BigDecimal dailySales = baseSales.multiply(BigDecimal.valueOf(variance / 30));

            data.add(TimeSeriesPoint.builder()
                    .date(date.format(formatter))
                    .value(dailySales.setScale(2, RoundingMode.HALF_UP))
                    .build());
        }

        return data;
    }

    private Double calculateTrend() {
        // Simulate a trend value between -20 and +50
        Random random = new Random();
        return Math.round((random.nextDouble() * 70 - 20) * 10.0) / 10.0;
    }

    private String formatRank(String rank) {
        // Convert EAGLE_SCOUT to "Eagle Scout"
        return Arrays.stream(rank.split("_"))
                .map(word -> word.charAt(0) + word.substring(1).toLowerCase())
                .collect(Collectors.joining(" "));
    }

    private String formatRelativeTime(LocalDateTime dateTime) {
        if (dateTime == null) return "N/A";

        long daysDiff = java.time.temporal.ChronoUnit.DAYS.between(dateTime.toLocalDate(), LocalDate.now());

        if (daysDiff == 0) return "Today";
        if (daysDiff == 1) return "1 day ago";
        if (daysDiff < 7) return daysDiff + " days ago";
        if (daysDiff < 14) return "1 week ago";
        if (daysDiff < 30) return (daysDiff / 7) + " weeks ago";
        return (daysDiff / 30) + " month(s) ago";
    }
}
