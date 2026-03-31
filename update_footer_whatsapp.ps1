$fontawesome = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">'
$whatsapp = '
    <!-- WhatsApp Floating Button -->
    <a href="https://wa.me/233500000000" class="whatsapp-float" target="_blank">
        <i class="fab fa-whatsapp"></i>
    </a>
'

$newFooter = '
    <footer>
        <div class="footer-content">
            <div class="footer-section">
                <h3>Buying</h3>
                <a href="inventory.html">Find Cars</a>
                <a href="#">Why Choose GDA</a>
                <a href="#">Customer Reviews</a>
                <a href="#">Buying Guide</a>
            </div>
            <div class="footer-section">
                <h3>Support</h3>
                <a href="#">Help Center</a>
                <a href="#">Car Tracking</a>
                <a href="#">GDA Protection Program</a>
                <a href="#">Damage condition report</a>
                <a href="#">Shipping Schedule</a>
                <a href="#">Chassis Check</a>
            </div>
            <div class="footer-section">
                <h3>About Us</h3>
                <a href="#">Our Company</a>
                <a href="#">Company Profile</a>
                <a href="#">Global office</a>
                <a href="#">CSR Policy</a>
                <a href="#">Privacy Policy</a>
            </div>
            <div class="footer-section">
                <h3>Inquiry</h3>
                <a href="#">Contact</a>
                <a href="#">Vehicle Request</a>
                <a href="#">Car Inspection</a>
            </div>
            <div class="footer-section">
                <h3>Connect With Us</h3>
                <div class="social-icons">
                    <a href="#"><i class="fab fa-youtube"></i></a>
                    <a href="#"><i class="fab fa-facebook"></i></a>
                    <a href="#"><i class="fab fa-instagram"></i></a>
                </div>
                <a href="#">GDA News <i class="fas fa-external-link-alt" style="font-size: 0.7rem;"></i></a>
                <a href="#">News Letter <i class="fas fa-external-link-alt" style="font-size: 0.7rem;"></i></a>
                
                <div class="country-select">
                    <p style="margin-bottom: 5px; font-weight: 600;">Global office</p>
                    <select>
                        <option>Select a country</option>
                        <option>Ghana</option>
                        <option>Nigeria</option>
                        <option>Kenya</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2026 Global drive Africa. All rights reserved.</p>
        </div>
    </footer>
'

$files = Get-ChildItem -Filter *.html | Where-Object { $_.Name -ne "index.html" }

foreach ($f in $files) {
    Write-Host "Updating $($f.Name)..."
    $content = Get-Content $f.FullName -Raw
    
    # 1. Add FontAwesome to head if not present
    if ($content -notmatch 'font-awesome') {
        $content = $content -replace '<link rel="stylesheet" href="css/style.css">', ('<link rel="stylesheet" href="css/style.css">`n    ' + $fontawesome)
    }
    
    # 2. Replace Footer
    $content = $content -replace '<footer>(.*?)</footer>', $newFooter
    
    # 3. Add WhatsApp Button if not present
    if ($content -notmatch 'whatsapp-float') {
        $content = $content -replace '</body>', ($whatsapp + '</body>')
    }
    
    Set-Content $f.FullName $content -NoNewline
}
