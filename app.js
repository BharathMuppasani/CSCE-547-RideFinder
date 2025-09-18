// This file contains shared functions used across multiple HTML pages
// to keep our code DRY (Don't Repeat Yourself).

const CART_KEY = 'dirtBikeAppCart';
const THEME_KEY = 'dirtBikeAppTheme';

// --- Theme Management ---

/**
 * Initializes the theme based on user's saved preference.
 * Defaults to light theme if no preference is saved.
 */
function initializeTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

/**
 * Toggles the theme between light and dark and saves the preference.
 */
function toggleTheme() {
    document.documentElement.classList.toggle('dark');
    const isDarkMode = document.documentElement.classList.contains('dark');
    localStorage.setItem(THEME_KEY, isDarkMode ? 'dark' : 'light');
}

// --- Toast Notifications ---

/**
 * Shows a small, non-intrusive notification toast.
 * @param {'success'|'error'|'info'} icon - The icon to display.
 * @param {string} title - The message to show.
 */
function showToast(icon, title) {
    const isDark = document.documentElement.classList.contains('dark');
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        },
        customClass: {
            popup: isDark ? 'dark-swal' : ''
        }
    });
    Toast.fire({ icon, title });
}


// --- Cart Management Functions ---

/**
 * Retrieves the cart from localStorage.
 * @returns {{items: Array<Object>}} The cart object.
 */
function getCart() {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : { items: [] };
}

/**
 * Saves the cart to localStorage.
 * @param {Object} cart - The cart object to save.
 */
function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

/**
 * Clears the entire cart from localStorage.
 */
function clearCart() {
    localStorage.removeItem(CART_KEY);
}

/**
 * Adds an item to the cart. If an item for the same park and duration exists, it merges them.
 * @param {Object} newItem - The item to add.
 */
function addItemToCart(newItem) {
    const cart = getCart();
    // An item is unique by its parkId AND the number of days.
    const existingItemIndex = cart.items.findIndex(item => item.parkId === newItem.parkId && item.days === newItem.days);
    
    if (existingItemIndex > -1) {
        // If found, just update the ticket counts
        cart.items[existingItemIndex].tickets.adults += newItem.tickets.adults;
        cart.items[existingItemIndex].tickets.kids += newItem.tickets.kids;
    } else {
        // Otherwise, add the new item
        cart.items.push({ ...newItem, id: `cart-${Date.now()}` });
    }
    saveCart(cart);
}

/**
 * Removes an item from the cart by its unique ID.
 * @param {string} itemId - The ID of the item to remove.
 */
function removeItemFromCart(itemId) {
    const cart = getCart();
    cart.items = cart.items.filter(item => item.id !== itemId);
    saveCart(cart);
}

/**
 * Updates the quantity of a specific ticket type (adults/kids) for a cart item.
 * If total tickets for an item becomes zero, it's removed from the cart.
 * @param {string} itemId - The ID of the item to update.
 * @param {'adults'|'kids'} ticketType - The type of ticket to update.
 * @param {number} newQuantity - The new quantity for the ticket type.
 */
function updateCartItemQuantity(itemId, ticketType, newQuantity) {
    const cart = getCart();
    const itemIndex = cart.items.findIndex(item => item.id === itemId);
    
    if (itemIndex > -1) {
        if (newQuantity >= 0) {
            cart.items[itemIndex].tickets[ticketType] = newQuantity;
            // If both adults and kids are zero, remove the item entirely.
            if (cart.items[itemIndex].tickets.adults === 0 && cart.items[itemIndex].tickets.kids === 0) {
                cart.items.splice(itemIndex, 1);
            }
        }
    }
    saveCart(cart);
}

// --- UI Update Functions ---

/**
 * Updates the cart item count indicator in the header.
 */
function updateCartCount() {
    const cart = getCart();
    const count = cart.items.reduce((total, item) => total + item.tickets.adults + item.tickets.kids, 0);
    const cartCountEl = document.getElementById('cart-item-count');
    if (cartCountEl) {
        cartCountEl.textContent = count;
        cartCountEl.style.display = count > 0 ? 'flex' : 'none';
    }
}


// --- SVG Icons ---
const ICONS = {
    logo: `<svg class="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z"/><path d="m15 12-3 3-3-3"/></svg>`,
    mapPin: `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
    star: `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    starEmpty: `<svg class="icon icon--empty" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    cart: `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.16"/></svg>`,
    moon: `<svg class="icon moon-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
    sun: `<svg class="icon sun-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
    empty: `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 12a9.5 9.5 0 1 1-19 0 9.5 9.5 0 0 1 19 0Z" /><path d="M15 9l-6 6m0-6l6 6" /></svg>`,
    trash: `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`
}


// --- HTML Generation Functions ---

/**
 * Renders the main site header into the `<header>` element.
 */
function renderHeader() {
    const header = document.getElementById('main-header');
    if (!header) return;
    header.innerHTML = `
        <nav class="main-nav container mx-auto px-4 sm:px-6 lg:px-8">
            <a href="index.html" class="logo-link">
                ${ICONS.logo}
                <span>RideFinder</span>
            </a>
            <div class="nav-actions">
                <button class="theme-toggle" id="theme-toggle-btn" aria-label="Toggle theme">
                    ${ICONS.moon}
                    ${ICONS.sun}
                </button>
                <a href="cart.html" class="cart-link" aria-label="View Shopping Cart">
                    ${ICONS.cart}
                    <span id="cart-item-count" class="cart-item-count">0</span>
                </a>
            </div>
        </nav>
    `;
    document.getElementById('theme-toggle-btn').addEventListener('click', toggleTheme);
    updateCartCount();
}

/**
 * Generates HTML for a star rating display.
 * @param {number} rating - The rating value (e.g., 4.5).
 * @returns {string} HTML string for the stars.
 */
function getStarRatingHTML(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
        stars += i < fullStars ? ICONS.star : ICONS.starEmpty;
    }
    return `<div class="star-rating flex items-center">${stars}</div>`;
}

/**
 * Creates the HTML for a single park card.
 * @param {Object} park - The park data object.
 * @returns {string} HTML string for the park card.
 */
function createParkCardHTML(park) {
    return `
        <div class="park-card">
            <a href="park-details.html?id=${park.id}" class="block">
                <img src="${park.imageUrl}" alt="${park.name}" class="park-card__image">
            </a>
            <div class="park-card__content">
                <h3 class="text-xl font-bold">${park.name}</h3>
                <p class="park-card__location">${ICONS.mapPin} ${park.location}</p>
                <div class="park-card__rating">
                    ${getStarRatingHTML(park.rating)}
                    <span class="park-card__rating-text">${park.rating.toFixed(1)} (${park.reviewCount} reviews)</span>
                </div>
                <p class="park-card__description">${park.shortDescription}</p>
                <a href="park-details.html?id=${park.id}" class="btn btn-primary mt-auto">Book Now</a>
            </div>
        </div>
    `;
}

/**
 * Creates the HTML for a single review card.
 * @param {Object} review - The review data object.
 * @returns {string} HTML string for the review card.
 */
function createReviewCardHTML(review) {
    const reviewDate = new Date(review.createdAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
    return `
        <div class="review-card">
            <div class="flex items-start justify-between">
                <div>
                    <p class="font-bold">${review.author.isAnonymous ? 'Anonymous' : review.author.name}</p>
                    <p class="text-sm text-text-secondary">${reviewDate}</p>
                </div>
                ${getStarRatingHTML(review.rating)}
            </div>
            <h4 class="text-lg font-semibold mt-3">${review.title}</h4>
            <p class="mt-1 text-text-secondary">${review.body}</p>
        </div>
    `;
}

/**
 * Creates the HTML for a single item in the shopping cart.
 * @param {Object} item - The cart item object.
 * @returns {string} HTML string for the cart item.
 */
function createCartItemHTML(item) {
    const lineTotal = (item.tickets.adults * item.unitPrice.adult + item.tickets.kids * item.unitPrice.child) * item.days;
    return `
        <div class="cart-item">
            <img src="${item.parkImage}" alt="${item.parkName}" class="cart-item__image">
            <div class="cart-item__details">
                <div>
                    <h3 class="font-bold text-lg">${item.parkName}</h3>
                    <p class="text-sm text-text-secondary">${item.days} Day(s)</p>
                </div>
                <div class="flex items-center gap-4 mt-2">
                    <div>
                        <label for="adults-${item.id}" class="text-xs font-semibold">Adults</label>
                        <input type="number" id="adults-${item.id}" value="${item.tickets.adults}" min="0" data-item-id="${item.id}" data-type="adults" class="form-input cart-item__quantity-input quantity-input">
                    </div>
                    <div>
                        <label for="kids-${item.id}" class="text-xs font-semibold">Kids</label>
                        <input type="number" id="kids-${item.id}" value="${item.tickets.kids}" min="0" data-item-id="${item.id}" data-type="kids" class="form-input cart-item__quantity-input quantity-input">
                    </div>
                </div>
            </div>
            <div class="cart-item__actions">
                <p class="text-lg font-bold whitespace-nowrap">$${lineTotal.toFixed(2)}</p>
                <button data-item-id="${item.id}" class="remove-item-btn" aria-label="Remove item">
                  ${ICONS.trash}
                </button>
            </div>
        </div>
    `;
}

/**
 * Creates the HTML for the order summary component (used in cart and checkout).
 * @param {Object} cart - The cart data object.
 * @returns {string} HTML string for the order summary.
 */
function createCartSummaryHTML(cart) {
    const subtotal = cart.items.reduce((total, item) => total + (item.tickets.adults * item.unitPrice.adult + item.tickets.kids * item.unitPrice.child) * item.days, 0);
    const discount = subtotal > 500 ? subtotal * 0.10 : 0;
    const tax = (subtotal - discount) * 0.08;
    const total = subtotal - discount + tax;

    return `
        <div class="cart-summary">
            <h2 class="text-xl font-bold mb-4 border-b pb-3" style="border-color: var(--border-color);">Order Summary</h2>
            <div class="space-y-2">
                <div class="summary-row"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
                <div class="summary-row text-green-600"><span>Bundle Discount</span><span>-$${discount.toFixed(2)}</span></div>
                <div class="summary-row"><span>Tax (8%)</span><span>$${tax.toFixed(2)}</span></div>
                <div class="summary-row summary-total"><span>Total</span><span>$${total.toFixed(2)}</span></div>
            </div>
            <a href="checkout.html" class="btn btn-primary w-full mt-6">Proceed to Checkout</a>
        </div>
    `;
}

/**
 * Creates a slimmed-down order summary for the checkout page.
 * @param {Object} cart - The cart data object.
 * @returns {string} HTML string for the checkout summary.
 */
function createCheckoutSummaryHTML(cart) {
    const subtotal = cart.items.reduce((total, item) => total + (item.tickets.adults * item.unitPrice.adult + item.tickets.kids * item.unitPrice.child) * item.days, 0);
    const discount = subtotal > 500 ? subtotal * 0.10 : 0;
    const tax = (subtotal - discount) * 0.08;
    const total = subtotal - discount + tax;

    return `
        <h2 class="text-xl font-bold mb-4 border-b pb-3" style="border-color: var(--border-color);">Order Summary</h2>
        <div class="space-y-4">
            ${cart.items.map(item => `
                <div class="flex justify-between items-start">
                    <div>
                        <p class="font-semibold">${item.parkName}</p>
                        <p class="text-sm text-text-secondary">${item.tickets.adults} Adults, ${item.tickets.kids} Kids - ${item.days} Day(s)</p>
                    </div>
                    <p class="font-medium whitespace-nowrap">$${((item.tickets.adults * item.unitPrice.adult + item.tickets.kids * item.unitPrice.child) * item.days).toFixed(2)}</p>
                </div>
            `).join('')}
        </div>
        <div class="mt-6 pt-4 border-t space-y-2" style="border-color: var(--border-color);">
            <div class="summary-row"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
            <div class="summary-row text-green-600"><span>Discount</span><span>-$${discount.toFixed(2)}</span></div>
            <div class="summary-row"><span>Tax</span><span>$${tax.toFixed(2)}</span></div>
            <div class="summary-row summary-total"><span>Grand Total</span><span>$${total.toFixed(2)}</span></div>
        </div>
        <button id="checkout-btn" type="submit" form="checkout-form" class="btn btn-primary w-full mt-6">Place Order</button>
    `;
}

// --- Skeleton and Empty State HTML ---

function createParkCardSkeletonHTML() {
    return `
        <div class="skeleton-card">
            <div class="skeleton-img skeleton-pulse"></div>
            <div class="p-6">
                <div class="skeleton-text skeleton-pulse w-3/4 h-6 mb-3"></div>
                <div class="skeleton-text skeleton-pulse w-1/2 h-4 mb-4"></div>
                <div class="skeleton-text skeleton-pulse w-full h-4 mt-4"></div>
                <div class="skeleton-text skeleton-pulse w-5/6 h-4 mt-2"></div>
            </div>
        </div>
    `;
}

function createEmptyStateHTML(title, message, btnText, btnLink) {
    const buttonHTML = btnText && btnLink ? `<a href="${btnLink}" class="btn btn-primary mt-6">${btnText}</a>` : '';
    return `
        <div class="empty-state">
            ${ICONS.empty}
            <h3 class="text-2xl font-bold mt-4">${title}</h3>
            <p class="text-text-secondary">${message}</p>
            ${buttonHTML}
        </div>
    `;
}

/**
 * Creates the main content for the Park Details page.
 * @param {Object} park - The park data object.
 * @param {Array<Object>} reviews - An array of recent reviews for the park.
 * @returns {string} HTML string for the page content.
 */
function createParkDetailsHTML(park, reviews) {
    return `
        <div data-aos="fade-in">
            <img src="${park.imageUrl}" alt="${park.name}" class="details-hero-image">
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div class="md:col-span-2" data-aos="fade-right">
                <h1 class="text-4xl font-extrabold">${park.name}</h1>
                <div class="flex flex-wrap items-center text-text-secondary mt-2 mb-6 gap-x-4 gap-y-2">
                    <span class="flex items-center gap-2">${ICONS.mapPin} ${park.location}</span>
                    <span class="flex items-center gap-2">${getStarRatingHTML(park.rating)} ${park.rating.toFixed(1)} (${park.reviewCount} reviews)</span>
                </div>
                <h2 class="text-2xl font-bold mb-3 border-b pb-2" style="border-color: var(--border-color);">About the Park</h2>
                <p class="text-lg leading-relaxed text-text-secondary">${park.description}</p>
                <div class="mt-8">
                    <h2 class="text-2xl font-bold mb-3 border-b pb-2" style="border-color: var(--border-color);">Recent Reviews</h2>
                    <div class="space-y-4">
                        ${reviews.length > 0 ? reviews.map(createReviewCardHTML).join('') : '<p class="text-text-secondary">No reviews yet. Be the first!</p>'}
                    </div>
                    <a href="reviews.html?id=${park.id}" class="inline-block mt-4 font-semibold text-accent-primary hover:underline">View all ${park.reviewCount} reviews &rarr;</a>
                </div>
            </div>
            <div class="md:col-span-1" data-aos="fade-left">
                <div class="booking-widget">
                    <h2 class="text-xl font-bold mb-4">Book Your Ride</h2>
                    <div class="space-y-4">
                        <div>
                            <label for="adults" class="form-label">Adults ($${park.price.adult}/day)</label>
                            <input type="number" id="adults" min="0" value="1" class="form-input">
                        </div>
                        <div>
                            <label for="kids" class="form-label">Kids ($${park.price.child}/day)</label>
                            <input type="number" id="kids" min="0" value="0" class="form-input">
                        </div>
                        <div>
                            <label for="days" class="form-label">Days</label>
                            <select id="days" class="form-select">
                                <option value="1">1 Day</option><option value="2">2 Days</option><option value="3">3 Days</option>
                            </select>
                        </div>
                    </div>
                    <div class="booking-widget__total">
                        <span>Total:</span> <span id="total-price" class="text-accent-primary">$0.00</span>
                    </div>
                    <button id="add-to-cart-btn" class="btn btn-primary w-full mt-4">Add to Cart</button>
                </div>
            </div>
        </div>
    `;
}

function createParkDetailsSkeletonHTML() {
    return `
        <div class="w-full h-64 md:h-96 rounded-lg skeleton-pulse"></div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div class="md:col-span-2">
                <div class="h-10 w-3/4 rounded skeleton-pulse mb-4"></div>
                <div class="h-6 w-1/2 rounded skeleton-pulse mb-6"></div>
                <div class="h-5 w-full rounded skeleton-pulse mt-2"></div>
                <div class="h-5 w-full rounded skeleton-pulse mt-2"></div>
                <div class="h-5 w-5/6 rounded skeleton-pulse mt-2"></div>
            </div>
            <div class="bg-bg-secondary p-6 rounded-lg h-80 skeleton-pulse"></div>
        </div>
    `;
}

function createReviewsPageHTML(park, reviews) {
    const averageRating = reviews.length ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;
    return `
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
                <a href="park-details.html?id=${park.id}" class="text-accent-primary hover:underline">&larr; Back to ${park.name}</a>
                <h1 class="text-3xl font-bold mt-2">${park.name} Reviews</h1>
                <div class="flex items-center text-text-secondary mt-2">
                    ${getStarRatingHTML(averageRating)}
                    <span class="ml-2">${averageRating.toFixed(1)} average from ${reviews.length} reviews</span>
                </div>
            </div>
            <button id="add-review-btn" class="btn btn-primary mt-4 md:mt-0 shrink-0">
                Add Review
            </button>
        </div>
        <div class="space-y-6">
            ${reviews.length > 0 ? reviews.map(createReviewCardHTML).join('') : createEmptyStateHTML('No Reviews Yet', 'Be the first to share your experience!')}
        </div>
    `;
}

