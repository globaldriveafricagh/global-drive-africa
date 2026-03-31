import { Session } from '../security/crypto.js';
import { dbInstance } from '../database/db.js';
import { dbReady } from '../database/dummy-data.js';


export const UI = {
  sanitize(str) {
    if (!str) return '';
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  },
  renderNavbar() {
    // Dynamic Nav Links matching E-commerce strategy
    const navLinks = document.querySelector('.nav-links');
    if(navLinks) {
        navLinks.innerHTML = `
            <li><a href="inventory.html">All Cars</a></li>
            <li><a href="toyota.html">Toyota</a></li>
            <li><a href="honda.html">Honda</a></li>
            <li><a href="hyundai.html">Hyundai</a></li>
            <li><a href="three-tyre.html">Three Tyre</a></li>
            <li><a href="trice.html">Trice</a></li>
            <li><a href="cart.html" style="color:var(--primary-color); font-weight:bold;">Cart (<span id="cartCount">0</span>)</a></li>
        `;
    }

    const navContainer = document.getElementById('authNav');
    if (!navContainer) return;

    this.updateCartCount();
    
    const session = Session.getSession();
    if (session) {
      const dashLink = session.role === 'admin' ? 'admin.html' : 'dashboard.html';
      navContainer.innerHTML = `
        <a href="${dashLink}" class="btn btn-outline">Dashboard</a>
        <a href="#" id="logoutBtn" class="btn btn-main" style="margin-left: 10px;">Logout</a>
      `;
    } else {
      navContainer.innerHTML = `
        <a href="login.html" class="btn btn-outline">Login</a>
        <a href="register.html" class="btn btn-main" style="margin-left: 10px;">Register</a>
      `;
    }
  },

  updateCartCount() {
      const cart = JSON.parse(localStorage.getItem('cars_cart') || '[]');
      const countEl = document.getElementById('cartCount');
      if (countEl) countEl.innerText = cart.length;
  },

  addToCart(car) {
      let cart = JSON.parse(localStorage.getItem('cars_cart') || '[]');
      // Prevent duplicates
      if(!cart.find(c => c.id === car.id)) {
          cart.push(car);
          localStorage.setItem('cars_cart', JSON.stringify(cart));
          this.updateCartCount();
          alert('Added to Cart!');
      } else {
          alert('Car is already in your cart!');
      }
  },

  renderCarCards(cars, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (cars.length === 0) {
      container.innerHTML = `<p>No cars found matching your criteria.</p>`;
      return;
    }

    container.innerHTML = cars.map(car => `
      <div class="car-card" onclick="location.href='car-details.html?id=${car.id}'" style="cursor:pointer;">
        <img src="${encodeURI(car.image)}" alt="${this.sanitize(car.brand)} ${this.sanitize(car.model)}" class="car-img" onerror="this.src='https://via.placeholder.com/300x200?text=Car+Image'">
        <div class="car-details">
          <h3 class="car-title">${this.sanitize(String(car.year))} ${this.sanitize(car.brand)} ${this.sanitize(car.model)}</h3>
          <p style="color:var(--text-light); font-size:0.9em;">Color: ${this.sanitize(car.color || 'N/A')}</p>
          <p class="car-price">GHS ${car.price.toLocaleString()}</p>
          <div class="car-specs">
            <span>${this.sanitize(car.transmission)}</span>
            <span>${this.sanitize(car.fuel)}</span>
            <span>${this.sanitize(car.condition)}</span>
          </div>
          <div style="display:flex; gap:10px; margin-top: auto;" onclick="event.stopPropagation()">
             <a href="car-details.html?id=${car.id}" class="view-btn" style="flex:1;">View Details</a>
             <button class="btn btn-main addbtn" data-car='${JSON.stringify(car).replace(/'/g, "&apos;")}' style="border:none; border-radius:4px; cursor:pointer;" title="Add to Cart">🛒</button>
          </div>
        </div>
      </div>
    `).join('');

    // Attach Add to Cart Listeners
    container.querySelectorAll('.addbtn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const carData = JSON.parse(e.currentTarget.getAttribute('data-car'));
            UI.addToCart(carData);
        });
    });
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  UI.renderNavbar();

  // Attach logout handler
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      Session.clearSession();
      window.location.reload();
    });
  }

  // Handle Home Page Hero Search Form
  const searchForm = document.getElementById('heroSearchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(searchForm);
      const params = new URLSearchParams();
      if(formData.get('brand')) params.append('brand', formData.get('brand'));
      if(formData.get('maxPrice')) params.append('maxPrice', formData.get('maxPrice'));
      
      window.location.href = `inventory.html?${params.toString()}`;
    });
  }

  // Handle Home Page Latest Cars
  if (document.getElementById('latestCarsGrid')) {
    try {
      // Wait for seeding to finish so we have consistent IDs!
      await dbReady;
      
      const allCars = await dbInstance.getAll('cars');
      const available = allCars.filter(c => c.status === 'available').reverse();
      UI.renderCarCards(available.slice(0, 12), 'latestCarsGrid');
    } catch (e) {
      console.error('Home Page Grid Error:', e);
      document.getElementById('latestCarsGrid').innerHTML = '<p>Error loading cars. Please refresh the page.</p>';
    }
  }


});
