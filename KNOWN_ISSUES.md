# Known Issues - BSA Camp Card

## Lombok Annotation Processing Issue

**Status**: Maven compilation fails but IDE works fine
**Affected Files**: Service classes that depend on Lombok-generated getters
**Severity**: Build blocker

### Problem
Lombok `@Data` and `@Getter` annotations are not being processed during Maven compilation, causing "cannot find symbol" errors for getter methods. The entities compile fine, but service classes cannot access the generated getters.

### Affected Services
- `PushNotificationService.java`
- `NotificationService.java`
- `CampaignDispatchService.java`
- `CouncilService.java`

### Root Cause
The Lombok annotation processor is not running correctly during Maven's compilation phase, even though:
- Lombok dependency is in pom.xml
- `@Data` annotations are on entity classes
- IDE (VSCode/IntelliJ) can process annotations correctly

### Temporary Workarounds Applied
1. Manual logger fields added to `LocationService` instead of using `@Slf4j`
2. Boolean comparisons use `Boolean.FALSE.equals()` pattern

### Permanent Solution Needed
One of:
1. Add explicit Lombok annotation processor configuration to `pom.xml`:
   ```xml
   <plugin>
       <groupId>org.apache.maven.plugins</groupId>
       <artifactId>maven-compiler-plugin</artifactId>
       <configuration>
           <annotationProcessorPaths>
               <path>
                   <groupId>org.projectlombok</groupId>
                   <artifactId>lombok</artifactId>
                   <version>${lombok.version}</version>
               </path>
           </annotationProcessorPaths>
       </configuration>
   </plugin>
   ```

2. Or manually add getters to entities that are failing

3. Or use delombok to generate Java source before compilation

### Impact
- Backend does not compile with `mvnw compile`
- Docker builds will fail
- Deployment pipeline is broken
- IDE still works for development

### Next Steps
- [ ] Add Lombok annotation processor configuration to maven-compiler-plugin
- [ ] Test compilation with `./mvnw clean compile`
- [ ] Verify Docker build works
- [ ] Update CI/CD pipeline if needed

---

---

## App Store Review Submissions Cleanup

**Status**: Resolved (Feb 6, 2026)
**Severity**: Low

### Problem
Multiple review submissions (4 total) were created in App Store Connect during the automated submission process due to API state management. They are in `READY_FOR_REVIEW` state and cannot be cancelled/deleted via the API.

### Resolution
The final submission was completed successfully through the App Store Connect web UI. The stale review submissions do not affect the app or the active review. They will be cleaned up automatically by Apple once the review completes.

### Notes
- The App Store Connect API key (EAS Submit key) does not have permissions for App Privacy management
- App Privacy must be configured through the App Store Connect web UI by an Admin-level user
- Content rights declaration can be set via the API

---

**Last Updated**: February 6, 2026
