// ==========================================================================
// Módulo de Navegación
// ==========================================================================
const Navigation = {
    config: {
        scrollThreshold: 100,
        scrollDelay: 250
    },

    elements: {
        menuToggle: document.querySelector('.menu-toggle'),
        closeButton: document.querySelector('.close-button'),
        sidebar: document.querySelector('.sidebar'),
        overlay: document.querySelector('.overlay'),
        nav: document.querySelector('nav'),
        video: document.querySelector('.hero video')
    },

    state: {
        lastScrollPosition: 0,
        isScrolling: false
    },

    init() {
        this.setupEventListeners();
        this.setupScrollBehavior();
        this.setupVideoOptimization();
    },

    setupEventListeners() {
        // Eventos de menú móvil
        this.elements.menuToggle?.addEventListener('click', () => this.toggleSidebar(true));
        this.elements.closeButton?.addEventListener('click', () => this.toggleSidebar(false));
        this.elements.overlay?.addEventListener('click', () => this.toggleSidebar(false));

        // Cerrar menú con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.toggleSidebar(false);
        });
    },

    toggleSidebar(show) {
        const { sidebar, overlay } = this.elements;
        const action = show ? 'add' : 'remove';
        
        sidebar?.classList[action]('active');
        overlay?.classList[action]('active');
        document.body.style.overflow = show ? 'hidden' : '';
    },

    setupScrollBehavior() {
        window.addEventListener('scroll', () => {
            if (!this.state.isScrolling) {
                window.requestAnimationFrame(() => {
                    this.handleScroll();
                    this.state.isScrolling = false;
                });
                this.state.isScrolling = true;
            }
        });
    },

    handleScroll() {
        const currentScroll = window.pageYOffset;
        const { nav } = this.elements;
        const { scrollThreshold } = this.config;
        
        // Mostrar/ocultar navegación
        if (currentScroll > this.state.lastScrollPosition && currentScroll > scrollThreshold) {
            nav.style.transform = 'translateY(-100%)';
        } else {
            nav.style.transform = 'translateY(0)';
        }
        
        this.state.lastScrollPosition = currentScroll;
    },

    setupVideoOptimization() {
        if (!this.elements.video) return;

        // Detener video en móviles
        if (window.matchMedia('(max-width: 768px)').matches) {
            this.elements.video.pause();
            this.elements.video.remove();
        }
    }
};
// ==========================================================================
// Módulo del Carrito
// ==========================================================================
const Cart = {
    items: [],
    badge: document.querySelector('.cart-badge'),

    init() {
        this.loadCart();
        this.setupEventListeners();
    },

    loadCart() {
        const savedCart = localStorage.getItem('bellisimaCart');
        if (savedCart) {
            this.items = JSON.parse(savedCart);
            this.updateBadge();
        }
    },

    saveCart() {
        localStorage.setItem('bellisimaCart', JSON.stringify(this.items));
    },

    addItem(item) {
        this.items.push(item);
        this.updateBadge();
        this.saveCart();
    },

    updateBadge() {
        if (this.badge) {
            this.badge.textContent = this.items.length;
        }
    },

    setupEventListeners() {
        // Aquí se pueden agregar listeners para botones de "Agregar al carrito"
    }
};

// ==========================================================================
// Utilidades
// ==========================================================================
const Utils = {
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    isMobile() {
        return window.matchMedia('(max-width: 768px)').matches;
    }
};

// ==========================================================================
// Inicialización
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    Navigation.init();
    Cart.init();

    // Agregar animaciones suaves a los botones
    document.querySelectorAll('.action-button').forEach(button => {
        button.addEventListener('mouseover', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
        });
        
        button.addEventListener('mouseout', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    });
});