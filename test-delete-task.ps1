$baseUrl = "http://localhost:5000/api"

# 1. Login to get token
$loginBody = @{
    email = "admin@demo.com"
    password = "Demo@123"
    tenantSubdomain = "demo"
} | ConvertTo-Json

$loginResp = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -UseBasicParsing
$loginData = $loginResp.Content | ConvertFrom-Json
$token = $loginData.data.token
$headers = @{ "Authorization" = "Bearer $token" }

# 2. Get a project
$projectsResp = Invoke-WebRequest -Uri "$baseUrl/projects" -Headers $headers -UseBasicParsing
$projectId = ($projectsResp.Content | ConvertFrom-Json).data.projects[0].id

# 3. Create a task to delete
$createTaskBody = @{ title = "Task to Delete"; priority = "low" } | ConvertTo-Json
$createTaskResp = Invoke-WebRequest -Uri "$baseUrl/projects/$projectId/tasks" -Method POST -Headers $headers -Body $createTaskBody -ContentType "application/json" -UseBasicParsing
$taskId = ($createTaskResp.Content | ConvertFrom-Json).data.task.id

Write-Host "Created task $taskId for deletion"

# 4. Attempt to delete
try {
    $deleteResp = Invoke-WebRequest -Uri "$baseUrl/tasks/$taskId" -Method DELETE -Headers $headers -UseBasicParsing
    Write-Host "Delete Result: " $deleteResp.Content
} catch {
    Write-Host "Delete FAILED as expected (or actually failed): " $_
    if ($_.Exception.Response.StatusCode -eq "InternalServerError") {
        Write-Host "Received 500 Internal Server Error - This is likely the ReferenceError: userId is not defined bug!" -ForegroundColor Yellow
    }
}
