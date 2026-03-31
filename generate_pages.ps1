$pages = @(
    @{ File="why-gda.html"; Title="Why Choose GDA"; Sub="Experience Trust, Speed, and Reliability."; Body="Global Drive Africa provides a seamless car importing experience with professional inspections and secure payments." },
    @{ File="reviews.html"; Title="Customer Reviews"; Sub="What our satisfied drivers are saying."; Body="Read testimonials from thousands of happy car owners across Ghana who found their dream cars through GDA." },
    @{ File="buying-guide.html"; Title="Buying Guide"; Sub="A step-by-step guide to owning your car."; Body="Learn everything you need to know about purchasing a vehicle, from auction to delivery in your driveway." },
    @{ File="help-center.html"; Title="Help Center"; Sub="We are here to help you 24/7."; Body="Browse through our FAQs and guides to find answers to all your questions about GDA services." },
    @{ File="tracking.html"; Title="Car Tracking"; Sub="Monitor your vehicle's journey in real-time."; Body="Enter your Stock ID to see exactly where your imported car is on its way to Ghana." },
    @{ File="protection.html"; Title="GDA Protection Program"; Sub="Your investment is safe with us."; Body="Our comprehensive protection program covers shipping damages and mechanical failures during transit." },
    @{ File="damage-report.html"; Title="Damage Condition Report"; Sub="Full transparency on vehicle condition."; Body="Access detailed mechanical and cosmetic reports for every vehicle in our inventory." },
    @{ File="shipping.html"; Title="Shipping Schedule"; Sub="Plan your purchase according to arrival dates."; Body="Check our monthly shipping calendar for departure and arrival dates at Tema and Takoradi ports." },
    @{ File="chassis-check.html"; Title="Chassis Check"; Sub="Verify your vehicle's history."; Body="Use our chassis verification tool to check historical auction data and actual mileage of Japanese imports." },
    @{ File="profile.html"; Title="Company Profile"; Sub="The vision behind Africa's leading car marketplace."; Body="Download our full company profile to learn about our leadership, values, and expansion plans." },
    @{ File="offices.html"; Title="Global Office"; Sub="Find us in your region."; Body="GDA has local representative offices in Accra, Kumasi, Lagos, and Nairobi to assist you with local registration." },
    @{ File="csr.html"; Title="CSR Policy"; Sub="Giving back to the community."; Body="GDA is committed to road safety initiatives and environmental sustainability through our carbon offset program." },
    @{ File="privacy.html"; Title="Privacy Policy"; Sub="How we protect your personal data."; Body="We take your privacy seriously. Learn about how we collect and use your data to provide a better experience." },
    @{ File="vehicle-request"; Title="Vehicle Request"; Sub="Can't find what you need? We'll find it for you."; Body="Fill out our request form and our agents will source the exact make and model you desire from global auctions." },
    @{ File="inspection.html"; Title="Car Inspection"; Sub="Professional third-party inspections."; Body="We provide independent inspection certificates to ensure your vehicle meets all Ghana roadworthy standards." },
    @{ File="news.html"; Title="GDA News"; Sub="Latest updates from the automotive world."; Body="Stay informed about new import regulations, market trends, and GDA corporate announcements." },
    @{ File="newsletter.html"; Title="News Letter"; Sub="Subscribe for exclusive car deals."; Body="Join our mailing list to receive weekly alerts on new arrivals and limited-time discounts before they sell out." }
)

$template = Get-Content "about.html" -Raw

foreach ($p in $pages) {
    if ($p.File -notmatch "\.html$") { $p.File += ".html" }
    $content = $template
    $content = $content -replace "About Us - Global drive Africa", ($p.Title + " - Global drive Africa")
    $content = $content -replace "<h1>Our Company</h1>", ("<h1>" + $p.Title + "</h1>")
    $content = $content -replace "<p>Driving Export Excellence Across Africa Since 2020.</p>", ("<p>" + $p.Sub + "</p>")
    $content = $content -replace '<h2 style="color: var(--secondary-color); margin-bottom: 20px;">Who We Are</h2>', ('<h2 style="color: var(--secondary-color); margin-bottom: 20px;">About ' + $p.Title + '</h2>')
    $content = $content -replace '<p>Global Drive Africa is Ghana''s leading marketplace for verified vehicles. We specialize in importing high-quality cars from Japan, Europe, and the USA, providing our customers with reliable transportation at competitive prices.</p>', ("<p>" + $p.Body + "</p>")
    
    # Remove some extra sections from about to keep it clean
    $content = $content -replace '<h2 style="color: var(--secondary-color); margin: 30px 0 20px;">Our Mission</h2>[\s\S]*?</div>', '<div style="margin-top: 30px; font-style: italic;">Contact our team for more detailed information regarding this section.</div>'
    
    # Fix Active Link in Nav (remove class "active" from about link)
    $content = $content -replace 'class="active"', ''
    
    Set-Content $p.File $content -NoNewline
    Write-Host "Created $($p.File)"
}
