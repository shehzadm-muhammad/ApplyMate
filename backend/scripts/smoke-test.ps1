$ErrorActionPreference = "Stop"

$baseUrl = "http://localhost:8080"
$testEmail = "smoke.$(Get-Date -Format 'yyyyMMddHHmmssfff')@example.com"
$testPassword = "ApplyMate123!"
$secondEmail = $null

function Write-Pass {
    param([string]$Message)

    Write-Host "[PASS] $Message" -ForegroundColor Green
}

function Assert-Equal {
    param(
        $Actual,
        $Expected,
        [string]$Message
    )

    if ($Actual -ne $Expected) {
        throw "$Message. Expected '$Expected' but received '$Actual'."
    }

    Write-Pass $Message
}

function Assert-NotEmpty {
    param(
        $Value,
        [string]$Message
    )

    if ([string]::IsNullOrWhiteSpace([string]$Value)) {
        throw "$Message. Value was empty."
    }

    Write-Pass $Message
}

function Invoke-JsonRequest {
    param(
        [string]$Method,
        [string]$Uri,
        [object]$Body = $null,
        [hashtable]$Headers = @{}
    )

    $parameters = @{
        Method          = $Method
        Uri             = $Uri
        Headers         = $Headers
        UseBasicParsing = $true
    }

    if ($null -ne $Body) {
        $json = $Body | ConvertTo-Json -Depth 10

        $parameters.ContentType =
            "application/json; charset=utf-8"

        $parameters.Body =
            [System.Text.Encoding]::UTF8.GetBytes($json)
    }

    $response = Invoke-WebRequest @parameters

    $rawContent = $response.Content

    if ($rawContent -is [byte[]]) {
        $rawContent = [System.Text.Encoding]::UTF8.GetString(
            $rawContent
        )
    }
    elseif ($null -ne $rawContent) {
        $rawContent = [string]$rawContent
    }

    $parsedBody = $null

    if (-not [string]::IsNullOrWhiteSpace($rawContent)) {
        $parsedBody = $rawContent | ConvertFrom-Json
    }

    return [PSCustomObject]@{
        StatusCode = [int]$response.StatusCode
        Body       = $parsedBody
    }
}

function Assert-HttpError {
    param(
        [scriptblock]$Action,
        [int]$ExpectedStatus,
        [string]$Message
    )

    try {
        & $Action | Out-Null
    }
    catch {
        if ($null -eq $_.Exception.Response) {
            throw
        }

        $actualStatus =
            [int]$_.Exception.Response.StatusCode

        if ($actualStatus -ne $ExpectedStatus) {
            throw "$Message. Expected HTTP $ExpectedStatus but received HTTP $actualStatus."
        }

        Write-Pass "$Message returned HTTP $actualStatus"
        return
    }

    throw "$Message. Expected HTTP $ExpectedStatus, but the request succeeded."
}

Write-Host ""
Write-Host "ApplyMate Backend Smoke Test" -ForegroundColor Cyan
Write-Host "Test account: $testEmail"
Write-Host ""

try {
    # ---------------------------------------------------------
    # 1. System status
    # ---------------------------------------------------------

    $statusResponse = Invoke-JsonRequest `
        -Method Get `
        -Uri "$baseUrl/api/v1/status"

    Assert-Equal `
        $statusResponse.StatusCode `
        200 `
        "System endpoint returned HTTP 200"

    Assert-Equal `
        $statusResponse.Body.status `
        "UP" `
        "ApplyMate API status is UP"

    # ---------------------------------------------------------
    # 2. Actuator health
    # ---------------------------------------------------------

    $healthResponse = Invoke-JsonRequest `
        -Method Get `
        -Uri "$baseUrl/actuator/health"

    Assert-Equal `
        $healthResponse.StatusCode `
        200 `
        "Actuator health returned HTTP 200"

    Assert-Equal `
        $healthResponse.Body.status `
        "UP" `
        "Actuator reports the application as UP"

    # ---------------------------------------------------------
    # 3. Registration
    # ---------------------------------------------------------

    $registrationBody = @{
        firstName = "Smoke"
        lastName  = "Tester"
        email     = $testEmail
        password  = $testPassword
    }

    $registrationResponse = Invoke-JsonRequest `
        -Method Post `
        -Uri "$baseUrl/api/v1/auth/register" `
        -Body $registrationBody

    Assert-Equal `
        $registrationResponse.StatusCode `
        201 `
        "Registration returned HTTP 201"

    Assert-Equal `
        $registrationResponse.Body.email `
        $testEmail `
        "Registration returned the correct email"

    Assert-NotEmpty `
        $registrationResponse.Body.id `
        "Registration returned a user ID"

    # ---------------------------------------------------------
    # 4. Duplicate registration protection
    # ---------------------------------------------------------

    Assert-HttpError `
        -ExpectedStatus 409 `
        -Message "Duplicate registration" `
        -Action {
            Invoke-JsonRequest `
                -Method Post `
                -Uri "$baseUrl/api/v1/auth/register" `
                -Body $registrationBody
        }

    # ---------------------------------------------------------
    # 5. Login
    # ---------------------------------------------------------

    $loginBody = @{
        email    = $testEmail
        password = $testPassword
    }

    $loginResponse = Invoke-JsonRequest `
        -Method Post `
        -Uri "$baseUrl/api/v1/auth/login" `
        -Body $loginBody

    Assert-Equal `
        $loginResponse.StatusCode `
        200 `
        "Login returned HTTP 200"

    Assert-Equal `
        $loginResponse.Body.tokenType `
        "Bearer" `
        "Login returned a Bearer token"

    Assert-NotEmpty `
        $loginResponse.Body.accessToken `
        "Login returned an access token"

    $token = $loginResponse.Body.accessToken

    $authorizationHeaders = @{
        Authorization = "Bearer $token"
    }

    # ---------------------------------------------------------
    # 6. Invalid password protection
    # ---------------------------------------------------------

    $wrongLoginBody = @{
        email    = $testEmail
        password = "WrongPassword123!"
    }

    Assert-HttpError `
        -ExpectedStatus 401 `
        -Message "Incorrect password login" `
        -Action {
            Invoke-JsonRequest `
                -Method Post `
                -Uri "$baseUrl/api/v1/auth/login" `
                -Body $wrongLoginBody
        }

    # ---------------------------------------------------------
    # 7. Protected current-user endpoint
    # ---------------------------------------------------------

    Assert-HttpError `
        -ExpectedStatus 401 `
        -Message "Current-user endpoint without token" `
        -Action {
            Invoke-JsonRequest `
                -Method Get `
                -Uri "$baseUrl/api/v1/users/me"
        }

    $profileResponse = Invoke-JsonRequest `
        -Method Get `
        -Uri "$baseUrl/api/v1/users/me" `
        -Headers $authorizationHeaders

    Assert-Equal `
        $profileResponse.StatusCode `
        200 `
        "Current-user endpoint returned HTTP 200"

    Assert-Equal `
        $profileResponse.Body.email `
        $testEmail `
        "JWT resolved the correct user"

    Assert-Equal `
        $profileResponse.Body.firstName `
        "Smoke" `
        "Current-user profile returned the correct name"

    # ---------------------------------------------------------
    # 8. Initial applications list
    # ---------------------------------------------------------

    $initialListResponse = Invoke-JsonRequest `
        -Method Get `
        -Uri "$baseUrl/api/v1/applications" `
        -Headers $authorizationHeaders

    Assert-Equal `
        $initialListResponse.StatusCode `
        200 `
        "Initial applications request returned HTTP 200"

    Assert-Equal `
        @($initialListResponse.Body).Count `
        0 `
        "New user initially has zero applications"

    # ---------------------------------------------------------
    # 9. Application endpoint security
    # ---------------------------------------------------------

    Assert-HttpError `
        -ExpectedStatus 401 `
        -Message "Applications endpoint without token" `
        -Action {
            Invoke-JsonRequest `
                -Method Get `
                -Uri "$baseUrl/api/v1/applications"
        }

    # ---------------------------------------------------------
    # 10. Invalid application validation
    # ---------------------------------------------------------

    $invalidApplicationBody = @{
        company  = ""
        jobTitle = ""
        status   = $null
    }

    Assert-HttpError `
        -ExpectedStatus 400 `
        -Message "Invalid application request" `
        -Action {
            Invoke-JsonRequest `
                -Method Post `
                -Uri "$baseUrl/api/v1/applications" `
                -Headers $authorizationHeaders `
                -Body $invalidApplicationBody
        }

    # ---------------------------------------------------------
    # 11. Create application
    # ---------------------------------------------------------

    $applicationBody = @{
        jobUrl              = "https://example.com/jobs/java-developer"
        company             = "Example Bank"
        jobTitle            = "Java Developer"
        location            = "Birmingham"
        salary              = "GBP 35,000"
        status              = "APPLIED"
        notes               = "Created by automated smoke test"
        jobDescription      = "Backend Java development"
        requiredSkills      = "Java, Spring Boot, PostgreSQL"
        benefits            = "Hybrid working"
        recruiter           = "Jane Smith"
        applicationDeadline = "2026-08-31"
    }

    $createResponse = Invoke-JsonRequest `
        -Method Post `
        -Uri "$baseUrl/api/v1/applications" `
        -Headers $authorizationHeaders `
        -Body $applicationBody

    Assert-Equal `
        $createResponse.StatusCode `
        201 `
        "Application creation returned HTTP 201"

    Assert-NotEmpty `
        $createResponse.Body.id `
        "Created application has an ID"

    Assert-Equal `
        $createResponse.Body.company `
        "Example Bank" `
        "Created application has the correct company"

    Assert-Equal `
        $createResponse.Body.jobTitle `
        "Java Developer" `
        "Created application has the correct job title"

    Assert-Equal `
        $createResponse.Body.status `
        "APPLIED" `
        "Created application has the correct status"

    $applicationId = $createResponse.Body.id

    # ---------------------------------------------------------
    # 12. Retrieve applications
    # ---------------------------------------------------------

    $listResponse = Invoke-JsonRequest `
        -Method Get `
        -Uri "$baseUrl/api/v1/applications" `
        -Headers $authorizationHeaders

    Assert-Equal `
        $listResponse.StatusCode `
        200 `
        "Applications list returned HTTP 200"

    Assert-Equal `
        @($listResponse.Body).Count `
        1 `
        "Applications list contains one record"

    Assert-Equal `
        $listResponse.Body[0].id `
        $applicationId `
        "Applications list returned the created record"

    Assert-Equal `
        $listResponse.Body[0].company `
        "Example Bank" `
        "Applications list preserved the company"

        # ---------------------------------------------------------
    # Filtering and summary test data
    # ---------------------------------------------------------

        $savedApplicationBody = @{
            jobUrl              = "https://example.com/jobs/data-analyst"
            company             = "Insight Labs"
            jobTitle            = "Data Analyst"
            location            = "Birmingham"
            salary              = "GBP 32,000"
            status              = "SAVED"
            notes               = "Saved for later"
            jobDescription      = "Data analysis and reporting"
            requiredSkills      = "SQL, Python, Power BI"
            benefits            = "Flexible working"
            recruiter           = "Alex Taylor"
            applicationDeadline = "2026-09-30"
        }

        $savedCreateResponse = Invoke-JsonRequest `
            -Method Post `
            -Uri "$baseUrl/api/v1/applications" `
            -Headers $authorizationHeaders `
            -Body $savedApplicationBody

        Assert-Equal `
            $savedCreateResponse.StatusCode `
            201 `
            "Second application creation returned HTTP 201"

        $savedApplicationId = $savedCreateResponse.Body.id

        Assert-NotEmpty `
            $savedApplicationId `
            "Second application has an ID"

        # ---------------------------------------------------------
        # Status filter
        # ---------------------------------------------------------

        $statusFilterResponse = Invoke-JsonRequest `
            -Method Get `
            -Uri "$baseUrl/api/v1/applications?status=APPLIED" `
            -Headers $authorizationHeaders

        Assert-Equal `
            @($statusFilterResponse.Body).Count `
            1 `
            "Status filter returned one APPLIED application"

        Assert-Equal `
            $statusFilterResponse.Body[0].id `
            $applicationId `
            "Status filter returned the correct application"

        # ---------------------------------------------------------
        # Case-insensitive search
        # ---------------------------------------------------------

        $searchResponse = Invoke-JsonRequest `
            -Method Get `
            -Uri "$baseUrl/api/v1/applications?search=insight" `
            -Headers $authorizationHeaders

        Assert-Equal `
            @($searchResponse.Body).Count `
            1 `
            "Search returned one matching application"

        Assert-Equal `
            $searchResponse.Body[0].id `
            $savedApplicationId `
            "Search returned the Insight Labs application"

        # ---------------------------------------------------------
        # Combined status and search
        # ---------------------------------------------------------

        $combinedFilterResponse = Invoke-JsonRequest `
            -Method Get `
            -Uri "$baseUrl/api/v1/applications?status=APPLIED&search=bank" `
            -Headers $authorizationHeaders

        Assert-Equal `
            @($combinedFilterResponse.Body).Count `
            1 `
            "Combined status and search returned one application"

        Assert-Equal `
            $combinedFilterResponse.Body[0].id `
            $applicationId `
            "Combined filter returned the correct application"

        # ---------------------------------------------------------
        # Dashboard summary
        # ---------------------------------------------------------

        $summaryResponse = Invoke-JsonRequest `
            -Method Get `
            -Uri "$baseUrl/api/v1/applications/summary" `
            -Headers $authorizationHeaders

        Assert-Equal `
            $summaryResponse.StatusCode `
            200 `
            "Application summary returned HTTP 200"

        Assert-Equal `
            $summaryResponse.Body.total `
            2 `
            "Application summary total is correct"

        Assert-Equal `
            $summaryResponse.Body.applied `
            1 `
            "Application summary APPLIED count is correct"

        Assert-Equal `
            $summaryResponse.Body.saved `
            1 `
            "Application summary SAVED count is correct"

        Assert-Equal `
            $summaryResponse.Body.interview `
            0 `
            "Application summary INTERVIEW count is initially zero"    
    
        # ---------------------------------------------------------
    # 13. Retrieve one application
    # ---------------------------------------------------------

        $singleResponse = Invoke-JsonRequest `
            -Method Get `
            -Uri "$baseUrl/api/v1/applications/$applicationId" `
            -Headers $authorizationHeaders

        Assert-Equal `
            $singleResponse.StatusCode `
            200 `
            "Single application request returned HTTP 200"

        Assert-Equal `
            $singleResponse.Body.id `
            $applicationId `
            "Single application endpoint returned the correct record"

        # ---------------------------------------------------------
        # 14. Update application
        # ---------------------------------------------------------

        $updateBody = @{
            jobUrl              = "https://example.com/jobs/senior-java-developer"
            company             = "Updated Bank"
            jobTitle            = "Senior Java Developer"
            location            = "Birmingham"
            salary              = "GBP 40,000"
            status              = "INTERVIEW"
            notes               = "Interview booked for Monday"
            jobDescription      = "Backend development"
            requiredSkills      = "Java, Spring Boot, PostgreSQL"
            benefits            = "Hybrid working"
            recruiter           = "Jane Smith"
            applicationDeadline = "2026-09-15"
        }

        $updateResponse = Invoke-JsonRequest `
            -Method Put `
            -Uri "$baseUrl/api/v1/applications/$applicationId" `
            -Headers $authorizationHeaders `
            -Body $updateBody

        Assert-Equal `
            $updateResponse.StatusCode `
            200 `
            "Application update returned HTTP 200"

        Assert-Equal `
            $updateResponse.Body.company `
            "Updated Bank" `
            "Application update changed the company"

        Assert-Equal `
            $updateResponse.Body.status `
            "INTERVIEW" `
            "Application update changed the status"

        Assert-Equal `
            $updateResponse.Body.jobTitle `
            "Senior Java Developer" `
            "Application update changed the job title"

        # ---------------------------------------------------------
        # 15. Create second user for ownership testing
        # ---------------------------------------------------------

        $secondEmail =
            "smoke.second.$(Get-Date -Format 'yyyyMMddHHmmssfff')@example.com"

        $secondRegistrationBody = @{
            firstName = "Second"
            lastName  = "Tester"
            email     = $secondEmail
            password  = $testPassword
        }

        $secondRegistrationResponse = Invoke-JsonRequest `
            -Method Post `
            -Uri "$baseUrl/api/v1/auth/register" `
            -Body $secondRegistrationBody

        Assert-Equal `
            $secondRegistrationResponse.StatusCode `
            201 `
            "Second user registration returned HTTP 201"

        $secondLoginBody = @{
            email    = $secondEmail
            password = $testPassword
        }

        $secondLoginResponse = Invoke-JsonRequest `
            -Method Post `
            -Uri "$baseUrl/api/v1/auth/login" `
            -Body $secondLoginBody

        $secondHeaders = @{
            Authorization =
                "Bearer $($secondLoginResponse.Body.accessToken)"
        }

        # ---------------------------------------------------------
        # 16. Ownership protection
        # ---------------------------------------------------------

        Assert-HttpError `
            -ExpectedStatus 404 `
            -Message "Second user viewing another user's application" `
            -Action {
                Invoke-JsonRequest `
                    -Method Get `
                    -Uri "$baseUrl/api/v1/applications/$applicationId" `
                    -Headers $secondHeaders
            }

        Assert-HttpError `
            -ExpectedStatus 404 `
            -Message "Second user updating another user's application" `
            -Action {
                Invoke-JsonRequest `
                    -Method Put `
                    -Uri "$baseUrl/api/v1/applications/$applicationId" `
                    -Headers $secondHeaders `
                    -Body $updateBody
            }

        Assert-HttpError `
            -ExpectedStatus 404 `
            -Message "Second user deleting another user's application" `
            -Action {
                Invoke-JsonRequest `
                    -Method Delete `
                    -Uri "$baseUrl/api/v1/applications/$applicationId" `
                    -Headers $secondHeaders
            }

        # ---------------------------------------------------------
        # 17. Delete application as its owner
        # ---------------------------------------------------------

        $deleteResponse = Invoke-JsonRequest `
            -Method Delete `
            -Uri "$baseUrl/api/v1/applications/$applicationId" `
            -Headers $authorizationHeaders

        Assert-Equal `
            $deleteResponse.StatusCode `
            204 `
            "Application deletion returned HTTP 204"

            $deleteSavedResponse = Invoke-JsonRequest `
            -Method Delete `
            -Uri "$baseUrl/api/v1/applications/$savedApplicationId" `
            -Headers $authorizationHeaders

        Assert-Equal `
            $deleteSavedResponse.StatusCode `
            204 `
            "Second application deletion returned HTTP 204"

        Assert-HttpError `
            -ExpectedStatus 404 `
            -Message "Deleted application retrieval" `
            -Action {
                Invoke-JsonRequest `
                    -Method Get `
                    -Uri "$baseUrl/api/v1/applications/$applicationId" `
                    -Headers $authorizationHeaders
            }

        $finalListResponse = Invoke-JsonRequest `
            -Method Get `
            -Uri "$baseUrl/api/v1/applications" `
            -Headers $authorizationHeaders

        Assert-Equal `
            @($finalListResponse.Body).Count `
            0 `
            "Applications list is empty after deletion"    

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "APPLYMATE BACKEND SMOKE TEST PASSED" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "User ID:        $($registrationResponse.Body.id)"
    Write-Host "Application ID: $applicationId"
    Write-Host ""
}
finally {
    Write-Host "Removing smoke-test account and application..."

        $escapedTestEmail = $testEmail.Replace("'", "''")

        docker exec applymate-postgres psql `
            -U applymate `
            -d applymate `
            -v ON_ERROR_STOP=1 `
            -c "DELETE FROM app_users WHERE email = '$escapedTestEmail';" `
            | Out-Null

        if (-not [string]::IsNullOrWhiteSpace($secondEmail)) {
            $escapedSecondEmail = $secondEmail.Replace("'", "''")

            docker exec applymate-postgres psql `
                -U applymate `
                -d applymate `
                -v ON_ERROR_STOP=1 `
                -c "DELETE FROM app_users WHERE email = '$escapedSecondEmail';" `
                | Out-Null
        }

    Write-Pass "Smoke-test data removed"
}