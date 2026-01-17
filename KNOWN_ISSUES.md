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

**Last Updated**: January 17, 2026
