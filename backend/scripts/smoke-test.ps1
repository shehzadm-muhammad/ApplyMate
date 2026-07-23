$ErrorActionPreference = "Stop"

$baseUrl = "http://localhost:8080"
$testEmail = "smoke.$(Get-Date -Format 'yyyyMMddHHmmssfff')@example.com"
$testPassword = "ApplyMate123!"

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

    docker exec applymate-postgres psql `
        -U applymate `
        -d applymate `
        -v ON_ERROR_STOP=1 `
        -c "DELETE FROM app_users WHERE email = '$testEmail';" `
        | Out-Null

    Write-Pass "Smoke-test data removed"
}