package com.bsa.campcard.service;

import com.bsa.campcard.dto.DashboardResponse;
import com.bsa.campcard.dto.DashboardResponse.*;
import com.bsa.campcard.entity.*;
import com.bsa.campcard.entity.CardOrder;
import com.bsa.campcard.entity.CampCard;
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
    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final org.bsa.campcard.domain.user.UserRepository userRepository;
    private final CampCardRepository campCardRepository;
    private final CardOrderRepository cardOrderRepository;
    private final OfferRedemptionRepository offerRedemptionRepository;

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

        // Subscription analytics
        List<Subscription> allSubscriptions = subscriptionRepository.findAll();
        long totalSubscriptions = allSubscriptions.stream()
                .filter(s -> s.getDeletedAt() == null)
                .count();
        long activeSubscriptions = allSubscriptions.stream()
                .filter(s -> s.getStatus() == Subscription.SubscriptionStatus.ACTIVE && s.getDeletedAt() == null)
                .count();
        long canceledSubscriptions = allSubscriptions.stream()
                .filter(s -> s.getStatus() == Subscription.SubscriptionStatus.CANCELED && s.getDeletedAt() == null)
                .count();

        // Count plans by billing interval
        Map<Long, SubscriptionPlan> planMap = new HashMap<>();
        for (SubscriptionPlan plan : subscriptionPlanRepository.findAll()) {
            planMap.put(plan.getId(), plan);
        }

        long monthlyPlans = 0;
        long annualPlans = 0;
        long mrrCents = 0;
        for (Subscription sub : allSubscriptions) {
            if (sub.getStatus() != Subscription.SubscriptionStatus.ACTIVE || sub.getDeletedAt() != null) continue;
            SubscriptionPlan plan = planMap.get(sub.getPlanId());
            if (plan == null) continue;
            if (plan.getBillingInterval() == SubscriptionPlan.BillingInterval.MONTHLY) {
                monthlyPlans++;
                mrrCents += plan.getPriceCents();
            } else {
                annualPlans++;
                mrrCents += plan.getPriceCents() / 12;
            }
        }
        long arrCents = mrrCents * 12;

        // Churn rate: canceled / total (as percentage)
        double churnRate = totalSubscriptions > 0 ?
                (double) canceledSubscriptions / totalSubscriptions * 100 : 0.0;
        double retentionRate = 100.0 - churnRate;

        // User metrics
        long totalUsersCount = userRepository.count();
        long activeUsersCount = userRepository.findAll().stream()
                .filter(u -> u.getIsActive() != null && u.getIsActive())
                .count();
        long newUsersLast30Days = userRepository.findAll().stream()
                .filter(u -> u.getCreatedAt() != null &&
                        u.getCreatedAt().isAfter(LocalDateTime.now().minusDays(30)))
                .count();

        // Card metrics
        long totalCardsCount = campCardRepository.count();
        long activeCardsCount = campCardRepository.findByStatusIn(
                List.of(CampCard.CampCardStatus.ACTIVE, CampCard.CampCardStatus.UNASSIGNED))
                .size();
        long totalRedemptionsCount = offerRedemptionRepository.count();

        // Transaction / Revenue metrics
        Long totalRevenueCentsVal = cardOrderRepository.getTotalRevenueCents();
        if (totalRevenueCentsVal == null) totalRevenueCentsVal = 0L;
        long totalTransactionsCount = cardOrderRepository.findByPaymentStatusIn(
                List.of(CardOrder.PaymentStatus.PAID)).size();
        long failedTransactionsCount = cardOrderRepository.findByPaymentStatusIn(
                List.of(CardOrder.PaymentStatus.FAILED)).size();
        long avgTransactionCentsVal = totalTransactionsCount > 0 ?
                totalRevenueCentsVal / totalTransactionsCount : 0L;

        // Get BSA reporting data
        List<TroopSalesData> troopSales = getTroopSalesData();
        List<TroopRecruitingData> troopRecruiting = getTroopRecruitingData();
        List<ScoutSalesData> scoutSales = getScoutSalesData();
        List<ScoutReferralData> scoutReferrals = getScoutReferralData();
        List<CustomerReferralData> customerReferrals = getCustomerReferralData();

        // Get time series data
        List<TimeSeriesPoint> salesTrend30Days = generateSalesTrend30Days();

        // Offer distribution by category
        List<DashboardResponse.CategoryCount> offerDistribution = getOfferDistribution();

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
                // User metrics
                .totalUsers(totalUsersCount)
                .activeUsers(activeUsersCount)
                .newUsersLast30Days(newUsersLast30Days)
                // Subscription metrics
                .totalSubscriptions(totalSubscriptions)
                .activeSubscriptions(activeSubscriptions)
                .monthlyPlans(monthlyPlans)
                .annualPlans(annualPlans)
                .trialUsers(0L)
                .cancellations(canceledSubscriptions)
                .mrr(mrrCents / 100)
                .arr(arrCents / 100)
                .churnRate(Math.round(churnRate * 10.0) / 10.0)
                .retentionRate(Math.round(retentionRate * 10.0) / 10.0)
                .upgradeRate(0.0)
                .downgradeRate(0.0)
                // Card metrics
                .totalCards(totalCardsCount)
                .activeCards(activeCardsCount)
                .totalRedemptions(totalRedemptionsCount)
                // Revenue / Transaction metrics
                .totalRevenueCents(totalRevenueCentsVal)
                .totalTransactions(totalTransactionsCount)
                .failedTransactions(failedTransactionsCount)
                .avgTransactionCents(avgTransactionCentsVal)
                // Trends
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
                .offerDistribution(offerDistribution)
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

        LocalDateTime startDate = today.minusDays(29).atStartOfDay();
        LocalDateTime endDate = today.plusDays(1).atStartOfDay();

        try {
            List<Object[]> dailyRevenue = cardOrderRepository.getDailyRevenueBetweenDates(startDate, endDate);
            Map<String, BigDecimal> revenueByDate = new HashMap<>();
            for (Object[] row : dailyRevenue) {
                // row[0] = DATE, row[1] = totalRevenueCents, row[2] = totalQuantity
                LocalDate rowDate;
                if (row[0] instanceof java.sql.Date) {
                    rowDate = ((java.sql.Date) row[0]).toLocalDate();
                } else if (row[0] instanceof LocalDate) {
                    rowDate = (LocalDate) row[0];
                } else {
                    continue;
                }
                long revenueCents = row[1] instanceof Number ? ((Number) row[1]).longValue() : 0L;
                revenueByDate.put(rowDate.format(formatter),
                        BigDecimal.valueOf(revenueCents).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP));
            }

            // Fill in all 30 days (0 for days with no orders)
            for (int i = 29; i >= 0; i--) {
                LocalDate date = today.minusDays(i);
                String key = date.format(formatter);
                data.add(TimeSeriesPoint.builder()
                        .date(key)
                        .value(revenueByDate.getOrDefault(key, BigDecimal.ZERO))
                        .build());
            }
        } catch (Exception e) {
            log.warn("Failed to fetch daily revenue data, returning empty trend", e);
            // Return 30 days of zero values
            for (int i = 29; i >= 0; i--) {
                LocalDate date = today.minusDays(i);
                data.add(TimeSeriesPoint.builder()
                        .date(date.format(formatter))
                        .value(BigDecimal.ZERO)
                        .build());
            }
        }

        return data;
    }

    private List<DashboardResponse.CategoryCount> getOfferDistribution() {
        List<Offer> allOffers = offerRepository.findAll();
        Map<String, Long> countByCategory = allOffers.stream()
                .filter(o -> o.getStatus() == Offer.OfferStatus.ACTIVE)
                .collect(Collectors.groupingBy(
                        o -> o.getCategory() != null ? o.getCategory() : "Uncategorized",
                        Collectors.counting()
                ));
        return countByCategory.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(e -> DashboardResponse.CategoryCount.builder()
                        .name(e.getKey())
                        .value(e.getValue())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Get a lightweight summary scoped to a single troop (for UNIT_LEADER role).
     */
    public DashboardResponse getTroopSummary(Long troopId) {
        log.info("Fetching troop summary for troopId: {}", troopId);

        Troop troop = troopRepository.findById(troopId).orElse(null);
        if (troop == null) {
            return DashboardResponse.builder().build();
        }

        long activeScouts = scoutRepository.countByTroopIdAndStatus(troopId, Scout.ScoutStatus.ACTIVE);
        BigDecimal totalSales = scoutRepository.sumSalesByTroop(troopId);
        if (totalSales == null) totalSales = BigDecimal.ZERO;
        Integer cardsSold = scoutRepository.sumCardsSoldByTroop(troopId);

        // Count redemptions and referrals across all scouts in the troop
        List<Scout> troopScouts = scoutRepository.findActiveTroopMembers(troopId);
        long totalRedemptions = 0;
        long totalReferrals = 0;
        long successfulReferrals = 0;

        for (Scout scout : troopScouts) {
            if (scout.getUserId() != null) {
                totalRedemptions += offerRedemptionRepository.countCompletedByUserId(scout.getUserId());
                List<Referral> referrals = referralRepository.findByReferrerId(scout.getUserId());
                totalReferrals += referrals.size();
                successfulReferrals += referrals.stream()
                        .filter(r -> r.getStatus() == Referral.ReferralStatus.COMPLETED ||
                                     r.getStatus() == Referral.ReferralStatus.REWARDED)
                        .count();
            }
        }

        double referralConversionRate = totalReferrals > 0
                ? (double) successfulReferrals / totalReferrals * 100 : 0.0;

        return DashboardResponse.builder()
                .totalTroops(1L)
                .activeTroops(troop.getStatus() == Troop.TroopStatus.ACTIVE ? 1L : 0L)
                .totalScouts((long) troopScouts.size())
                .activeScouts(activeScouts)
                .totalSales(totalSales)
                .totalCardsSold(cardsSold != null ? cardsSold : 0)
                .totalReferrals(totalReferrals)
                .successfulReferrals(successfulReferrals)
                .referralConversionRate(Math.round(referralConversionRate * 10.0) / 10.0)
                .totalRedemptions(totalRedemptions)
                .totalRevenueCents(totalSales.multiply(BigDecimal.valueOf(100)).longValue())
                .build();
    }

    private Double calculateTrend() {
        // No historical period comparison data available yet
        return 0.0;
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
