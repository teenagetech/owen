// Mac OS 9 Desktop Functionality

// Global Variables
let zIndex = 100;
let activeWindow = null;
let currentDragTarget = null;
let draggingActive = false;
let clickedHeader = null;
let offsetX, offsetY;
let windowStartWidth, windowStartHeight;
let resizingActive = false;
let currentResizeHandle = null;
let currentResizeTarget = null;
let resizeStartX, resizeStartY;
let isMobile = false;
let draggedWindow = null;
let isResizing = false;
let isDragging = false;
let folderCounter = 0;
let lastClickedItem = null;
let windowZIndex = 100;
let dragOutline = null;
let resizeOutline = null;
let menuBarHeight = 0;
let isMenuOpen = false;
let activeMenu = null;

// Constants for minimum window size
const MIN_WINDOW_WIDTH = 300;
const MIN_WINDOW_HEIGHT = 200;

// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check device type first (mobile or desktop)
    checkDevice();
    
    // Initialize common components for both interfaces
    initializeDateTime();
    
    // Initialize startup screen (will call the appropriate interface init)
    initializeStartupScreen();
});

// Check if the device is mobile
function checkDevice() {
    // Consider a device mobile if it has a mobile user agent OR screen width is 600px or less
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 600;
    
    // Set appropriate interface
    const desktopInterface = document.getElementById('desktop');
    const mobileInterface = document.getElementById('ios-interface');
    
    if (isMobile) {
        if (desktopInterface) desktopInterface.style.display = 'none';
        if (mobileInterface) mobileInterface.style.display = 'block';
        document.body.classList.add('mobile-device');
    } else {
        if (desktopInterface) desktopInterface.style.display = 'block';
        if (mobileInterface) mobileInterface.style.display = 'none';
        document.body.classList.remove('mobile-device');
    }
    
    // Add resize listener to handle orientation changes
    window.addEventListener('resize', function() {
        const wasMobile = isMobile;
        // Update mobile check with new 600px breakpoint
        isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 600;
        
        if (wasMobile !== isMobile) {
            location.reload(); // Reload to switch interfaces
        } else if (isMobile) {
            // Just update orientation if staying in mobile
            handleMobileOrientation();
        }
    });
    
    // Initial orientation handling for mobile
    if (isMobile) {
        handleMobileOrientation();
    }
}

// Handle mobile orientation changes
function handleMobileOrientation() {
    const isLandscape = window.innerWidth > window.innerHeight;
    
    if (isLandscape) {
        document.body.classList.add('landscape');
        document.body.classList.remove('portrait');
    } else {
        document.body.classList.add('portrait');
        document.body.classList.remove('landscape');
    }
}

// Initialize mobile interface
function initializeMobileInterface() {
    if (!isMobile) return;
    
    // Initialize mobile fonts
    initializeMobileFonts();
    
    // Set up real-time clock for iOS interface
    updateMobileTime();
    setInterval(updateMobileTime, 60000); // Update every minute
    
    // Add click events to app icons
    const appIcons = document.querySelectorAll('.ios-app');
    appIcons.forEach(app => {
        app.addEventListener('click', function() {
            const appType = this.getAttribute('data-app');
            openMobileApp(appType);
        });
    });
    
    // Add click events to back buttons
    const backButtons = document.querySelectorAll('.ios-back-button');
    backButtons.forEach(button => {
        button.addEventListener('click', function() {
            closeAllMobileApps();
        });
    });
}

// Initialize mobile fonts
function initializeMobileFonts() {
    // Add class to indicate mobile font loading
    document.documentElement.classList.add('mobile-fonts-loading');
    
    // Check if FontFaceObserver is available
    if (typeof FontFaceObserver !== 'undefined') {
        const helvetica = new FontFaceObserver('Helvetica');
        
        // Load Helvetica font with timeout
        helvetica.load(null, 3000).then(() => {
            console.log('Mobile font loaded successfully');
            document.documentElement.classList.remove('mobile-fonts-loading');
            document.documentElement.classList.add('mobile-fonts-loaded');
        }).catch(err => {
            console.log('Mobile font loading error:', err);
            // Add the class anyway to avoid interface issues
            document.documentElement.classList.remove('mobile-fonts-loading');
            document.documentElement.classList.add('mobile-fonts-loaded');
        });
    } else {
        // No FontFaceObserver, assume fonts are loaded after a delay
        setTimeout(() => {
            document.documentElement.classList.remove('mobile-fonts-loading');
            document.documentElement.classList.add('mobile-fonts-loaded');
        }, 800);
    }
}

// Initialize desktop interface
function initializeDesktopInterface() {
    if (isMobile) return;
    
    initializeFonts();
    initializeDesktop();
    initializeMenus();
    initializeWindows();
    initializeCursors();
    initializeContextMenu();
    initializeAlerts();
}

// Startup screen handling
function initializeStartupScreen() {
    const startupScreen = document.getElementById('startup-screen');
    const loadingBar = document.getElementById('loading-bar');
    const startupSubtext = document.querySelector('.startup-subtext');
    
    // Set up startup messages for the typing effect
    const startupMessages = [
        'Starting up...',
        'Loading resources...',
        'Initializing system...',
        'Preparing desktop...'
    ];
    let currentMessageIndex = 0;
    let messageCharIndex = 0;
    let messageUpdateInterval;
    
    // Function for typewriter effect
    function typeMessage() {
        const currentMessage = startupMessages[currentMessageIndex];
        
        if (messageCharIndex < currentMessage.length) {
            startupSubtext.textContent = currentMessage.substring(0, messageCharIndex + 1);
            messageCharIndex++;
        } else {
            // Move to next message after delay
            clearInterval(messageUpdateInterval);
            setTimeout(() => {
                messageCharIndex = 0;
                currentMessageIndex = (currentMessageIndex + 1) % startupMessages.length;
                messageUpdateInterval = setInterval(typeMessage, 100);
            }, 1500);
        }
    }
    
    // Start the typewriter effect
    messageUpdateInterval = setInterval(typeMessage, 100);
    
    // Track loading progress
    let progress = 0;
    const totalAssets = 20; // Approximate number of critical assets
    let loadedAssets = 0;
    
    // Function to update progress bar
    function updateProgress() {
        loadedAssets++;
        progress = Math.min((loadedAssets / totalAssets) * 100, 100);
        if (loadingBar) loadingBar.style.width = progress + '%';
        
        // When loading is complete
        if (progress >= 100) {
            setTimeout(() => {
                clearInterval(messageUpdateInterval); // Stop updating messages
                if (startupSubtext) startupSubtext.textContent = 'Ready.';
                
                setTimeout(() => {
                    if (startupScreen) startupScreen.classList.add('hidden');
                    
                    // Initialize appropriate interface after startup
                    if (isMobile) {
                        initializeMobileInterface();
                    } else {
                        initializeDesktopInterface();
                    }
                    
                    // Remove the startup screen from DOM after transition
                    setTimeout(() => {
                        if (startupScreen) startupScreen.style.display = 'none';
                    }, 1500);
                }, 600);
            }, 800); // Short delay to show 100%
        }
    }
    
    // Track image loading progress
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        // If image is already loaded or cached
        if (img.complete) {
            updateProgress();
        } else {
            // When image loads
            img.addEventListener('load', updateProgress);
            // If image fails to load, still update progress
            img.addEventListener('error', updateProgress);
        }
    });
    
    // Track font loading using FontFaceObserver if available, else simulate
    if (typeof FontFaceObserver !== 'undefined') {
        const charcoal = new FontFaceObserver('Charcoal');
        const geneva = new FontFaceObserver('geneva-9');
        
        Promise.all([charcoal.load(), geneva.load()]).then(() => {
            // Fonts loaded, update progress twice (once for each font)
            updateProgress();
            updateProgress();
        }).catch(err => {
            console.log('Font loading error:', err);
            // Still update progress to avoid stalling
            updateProgress();
            updateProgress();
        });
    } else {
        // Simulate font loading after a delay
        setTimeout(() => {
            updateProgress();
            updateProgress();
        }, 1000);
    }
    
    // Track CSS and other assets - simulated
    setTimeout(() => {
        // Update for CSS
        updateProgress();
        // Update for various other small assets
        for (let i = 0; i < 5; i++) {
            setTimeout(() => updateProgress(), i * 200);
        }
    }, 300);
    
    // Fallback: Ensure startup screen is hidden after a maximum time
    // In case something goes wrong with loading detection
    setTimeout(() => {
        if (startupScreen && !startupScreen.classList.contains('hidden')) {
            if (loadingBar) loadingBar.style.width = '100%';
            setTimeout(() => {
                startupScreen.classList.add('hidden');
                
                // Initialize appropriate interface in fallback case
                if (isMobile) {
                    initializeMobileInterface();
                } else {
                    initializeDesktopInterface();
                }
                
                setTimeout(() => {
                    startupScreen.style.display = 'none';
                }, 1500);
            }, 500);
        }
    }, 8000); // 8 second maximum loading time
}

// Update the time in the iOS status bar
function updateMobileTime() {
    const timeElement = document.getElementById('ios-time');
    if (!timeElement) return;
    
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    // 12-hour format for iOS
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    
    timeElement.textContent = `${hours}:${minutes} ${period}`;
}

// Open a mobile app
function openMobileApp(appType) {
    // Hide all app screens first
    closeAllMobileApps();
    
    // Show the selected app screen
    const appScreen = document.getElementById(`${appType}-screen`);
    if (appScreen) {
        appScreen.classList.add('active');
    }
}

// Close all mobile apps
function closeAllMobileApps() {
    const appScreens = document.querySelectorAll('.ios-content-screen');
    appScreens.forEach(screen => {
        screen.classList.remove('active');
    });
}

// Initialize date and time display
function initializeDateTime() {
    // Update date and time immediately
    updateDateTime();
    
    // Update date and time every minute
    setInterval(updateDateTime, 60000);
}

// Update date and time in the menu bar
function updateDateTime() {
    const dateTimeElement = document.querySelector('.date-time');
    if (!dateTimeElement) return;
    
    const now = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const day = days[now.getDay()];
    
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    // 12-hour format
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    
    dateTimeElement.textContent = `${day} ${hours}:${minutes} ${period}`;
}

// Clock function with real-time updates
function initializeClock() {
    const clockElement = document.getElementById('clock');
    
    function updateClock() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const meridiem = hours >= 12 ? 'PM' : 'AM';
        
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        
        clockElement.textContent = `${hours}:${minutes} ${meridiem}`;
    }
    
    updateClock(); // Initial update
    setInterval(updateClock, 1000); // Update every second for real-time
}

// Desktop Icons functionality
function initializeIcons() {
    // Get references after DOM is fully loaded
    dragOutline = document.getElementById('window-drag-outline');
    resizeOutline = document.getElementById('window-resize-outline');
    menuBarHeight = document.querySelector('.menu-bar').offsetHeight;
    
    const icons = document.querySelectorAll('.icon');
    
    icons.forEach(icon => {
        icon.addEventListener('click', function(e) {
            // Deselect all icons
            icons.forEach(i => i.classList.remove('selected'));
            
            // Select clicked icon
            this.classList.add('selected');
            lastClickedItem = this;
            
            // Prevent event bubbling to desktop
            e.stopPropagation();
        });
        
        icon.addEventListener('dblclick', function(e) {
            const windowId = this.getAttribute('data-window');
            if (windowId) {
                openWindow(`${windowId}-window`);
            }
        });
    });
    
    // Deselect all icons when clicking on desktop
    document.querySelector('.desktop').addEventListener('click', function() {
        icons.forEach(i => i.classList.remove('selected'));
        lastClickedItem = null;
    });
}

// Initialize cursor handling
function initializeCursors() {
    const icons = document.querySelectorAll('.icon');
    const menuItems = document.querySelectorAll('.menu-item');
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    const menuOptions = document.querySelectorAll('.menu-option');
    const windowHeaders = document.querySelectorAll('.window-header');
    const windowControls = document.querySelectorAll('.window-controls-left button, .window-controls-right button');
    const alertButtons = document.querySelectorAll('.alert-btn');
    const resizeHandles = document.querySelectorAll('.resize-handle');
    const textInputs = document.querySelectorAll('input[type="text"], textarea');
    const links = document.querySelectorAll('a');
    
    // Set default cursor for body
    document.body.classList.add('cursor-normal');
    
    // Apply pointer cursor to clickable elements
    const pointerElements = [
        ...icons, 
        ...menuItems, 
        ...dropdownItems, 
        ...menuOptions, 
        ...windowControls,
        ...alertButtons,
        ...links
    ];
    
    pointerElements.forEach(el => {
        el.classList.add('cursor-pointer');
    });
    
    // Apply text cursor to text inputs
    textInputs.forEach(input => {
        input.classList.add('cursor-ibeam');
    });
    
    // Keep normal cursor for resize handles
    resizeHandles.forEach(handle => {
        handle.classList.add('cursor-normal');
    });
}

// Window management functionality
function initializeWindows() {
    const windows = document.querySelectorAll('.window');
    
    windows.forEach(window => {
        const header = window.querySelector('.window-header');
        const closeBtn = window.querySelector('.close-btn');
        const minimizeBtn = window.querySelector('.minimize-btn');
        const zoomBtn = window.querySelector('.zoom-btn');
        const resizeHandle = window.querySelector('.resize-handle');
        
        // Store min dimensions explicitly for each window
        const computedStyle = getComputedStyle(window);
        window.minWidth = parseInt(computedStyle.minWidth) || MIN_WINDOW_WIDTH;
        window.minHeight = parseInt(computedStyle.minHeight) || MIN_WINDOW_HEIGHT;
        
        // Make window draggable (using outline)
        header.addEventListener('mousedown', function(e) {
            if (e.target === this || e.target.classList.contains('window-title') || 
                e.target.classList.contains('pinstripes-left') || 
                e.target.classList.contains('pinstripes-right') ||
                e.target.classList.contains('window-title-container')) {
                
                // Set up for dragging
                draggedWindow = window;
                activeWindow = window;
                isDragging = true;
                
                // Bring window to front
                bringToFront(window);
                
                // Calculate offset for dragging
                const rect = window.getBoundingClientRect();
                offsetX = e.clientX - rect.left;
                offsetY = e.clientY - rect.top;
                
                // Initialize drag outline
                dragOutline.style.width = rect.width + 'px';
                dragOutline.style.height = rect.height + 'px';
                dragOutline.style.left = rect.left + 'px';
                dragOutline.style.top = rect.top + 'px';
                dragOutline.style.display = 'block';
                
                e.preventDefault();
            }
        });
        
        // Set up resize handle for preview
        if (resizeHandle) {
            resizeHandle.addEventListener('mousedown', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                isResizing = true;
                activeWindow = window;
                bringToFront(window);
                
                // Store initial dimensions and position
                const rect = window.getBoundingClientRect();
                window.initialWidth = rect.width;
                window.initialHeight = rect.height;
                window.initialLeft = rect.left;
                window.initialTop = rect.top;
                
                // Store mouse position
                window.initialMouseX = e.clientX;
                window.initialMouseY = e.clientY;
                
                // Initialize resize outline
                resizeOutline.style.width = rect.width + 'px';
                resizeOutline.style.height = rect.height + 'px';
                resizeOutline.style.left = rect.left + 'px';
                resizeOutline.style.top = rect.top + 'px';
                resizeOutline.style.display = 'block';
            });
        }
        
        // Close button functionality
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                closeWindow(window.id);
            });
        }
        
        // Minimize button functionality
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', function() {
                minimizeWindow(window);
            });
        }
        
        // Zoom button functionality
        if (zoomBtn) {
            zoomBtn.addEventListener('click', function() {
                toggleZoom(window);
            });
        }
        
        // Activate window on click
        window.addEventListener('mousedown', function() {
            bringToFront(window);
        });
    });
    
    // Handle dragging and resizing on document level
    document.addEventListener('mousemove', function(e) {
        // Handle window dragging (update drag outline)
        if (isDragging && draggedWindow) {
            const desktop = document.querySelector('.desktop');
            const desktopRect = desktop.getBoundingClientRect();
            
            // Calculate new position for the outline
            let newLeft = e.clientX - offsetX;
            let newTop = e.clientY - offsetY;
            
            // Keep outline within desktop boundaries
            const outlineRect = dragOutline.getBoundingClientRect();
            const outlineWidth = outlineRect.width;
            const outlineHeight = outlineRect.height;
            
            // Constrain left/right
            if (newLeft < 0) newLeft = 0;
            if (newLeft + outlineWidth > desktopRect.width) {
                newLeft = desktopRect.width - outlineWidth;
            }
            
            // Constrain top/bottom (accounting for menu bar)
            if (newTop < menuBarHeight) newTop = menuBarHeight;
            if (newTop + outlineHeight > desktopRect.height) {
                newTop = desktopRect.height - outlineHeight;
            }
            
            // Update the outline position
            dragOutline.style.left = newLeft + 'px';
            dragOutline.style.top = newTop + 'px';
            
            e.preventDefault();
        }
        
        // Handle window resizing (update resize outline)
        if (isResizing && activeWindow) {
            const deltaX = e.clientX - activeWindow.initialMouseX;
            const deltaY = e.clientY - activeWindow.initialMouseY;
            
            // Get window-specific minimum dimensions
            const minWidth = activeWindow.minWidth;
            const minHeight = activeWindow.minHeight;
            
            // Calculate new width and height from bottom-right corner only
            // Use the window's actual minimum dimensions, not the generic ones
            const newWidth = Math.max(minWidth, activeWindow.initialWidth + deltaX);
            const newHeight = Math.max(minHeight, activeWindow.initialHeight + deltaY);
            
            // Keep outline within desktop boundaries
            const desktop = document.querySelector('.desktop');
            const desktopRect = desktop.getBoundingClientRect();
            
            let constrainedWidth = newWidth;
            let constrainedHeight = newHeight;
            
            // Adjust if outline would exceed desktop
            if (activeWindow.initialLeft + constrainedWidth > desktopRect.width) {
                constrainedWidth = desktopRect.width - activeWindow.initialLeft;
            }
            
            if (activeWindow.initialTop + constrainedHeight > desktopRect.height) {
                constrainedHeight = desktopRect.height - activeWindow.initialTop;
            }
            
            // Apply constraints but respect window's specific minimum dimensions
            constrainedWidth = Math.max(minWidth, constrainedWidth);
            constrainedHeight = Math.max(minHeight, constrainedHeight);
            
            // Update resize outline
            resizeOutline.style.width = constrainedWidth + 'px';
            resizeOutline.style.height = constrainedHeight + 'px';
            
            e.preventDefault();
        }
    });
    
    document.addEventListener('mouseup', function(e) {
        // Check if mouse released on menu bar for drag cancel
        const isOverMenuBar = e.clientY < menuBarHeight;
        
        // Finalize window dragging
        if (isDragging && draggedWindow) {
            // Hide the outline
            dragOutline.style.display = 'none';
            
            // Only apply position if not released on menu bar
            if (!isOverMenuBar) {
                const newLeft = parseInt(dragOutline.style.left);
                const newTop = parseInt(dragOutline.style.top);
                
                // Apply position to actual window
                draggedWindow.style.left = newLeft + 'px';
                draggedWindow.style.top = newTop + 'px';
            }
            
            isDragging = false;
            draggedWindow = null;
        }
        
        // Finalize window resizing
        if (isResizing && activeWindow) {
            // Hide the outline
            resizeOutline.style.display = 'none';
            
            // Apply new dimensions to the window
            if (!isOverMenuBar) {
                activeWindow.style.width = resizeOutline.style.width;
                activeWindow.style.height = resizeOutline.style.height;
            }
            
            isResizing = false;
            activeWindow = activeWindow; // Keep window active
        }
    });
}

// Bring window to front
function bringToFront(window) {
    const windows = document.querySelectorAll('.window');
    windows.forEach(w => {
        w.classList.remove('active');
        w.style.zIndex = '50';
    });
    window.classList.add('active');
    window.style.zIndex = ++windowZIndex;
    activeWindow = window;
}

// Open a window
function openWindow(windowId) {
    const targetWindow = document.getElementById(windowId);
    if (!targetWindow) return;
    
    // Position window in center if not already positioned
    if (!targetWindow.style.left) {
        const desktop = document.querySelector('.desktop');
        const desktopRect = desktop.getBoundingClientRect();
        const windowWidth = 500;
        const windowHeight = 400;
        
        const left = (desktopRect.width - windowWidth) / 2;
        const top = (desktopRect.height - windowHeight) / 2;
        
        targetWindow.style.left = left + 'px';
        targetWindow.style.top = top + 'px';
        targetWindow.style.width = windowWidth + 'px';
        targetWindow.style.height = windowHeight + 'px';
    }
    
    // Show and activate window
    targetWindow.style.display = 'block';
    targetWindow.classList.remove('minimized');
    bringToFront(targetWindow);
}

// Close a window
function closeWindow(windowId) {
    const targetWindow = document.getElementById(windowId);
    if (!targetWindow) return;
    
    targetWindow.style.display = 'none';
    targetWindow.classList.remove('active');
    targetWindow.classList.remove('minimized');
    
    // Check if any windows are still open
    const openWindows = Array.from(document.querySelectorAll('.window')).filter(w => w.style.display === 'block');
    if (openWindows.length > 0) {
        // Activate the last window
        const lastWindow = openWindows[openWindows.length - 1];
        bringToFront(lastWindow);
    } else {
        activeWindow = null;
    }
}

// Minimize a window
function minimizeWindow(window) {
    // Store restoration data if not already minimized
    if (!window.classList.contains('minimized')) {
        // Save current dimensions for later restoration
        window.dataset.restoreWidth = window.style.width;
        window.dataset.restoreHeight = window.style.height;
        
        // Toggle to minimized state
        window.classList.add('minimized');
        
        // Set width to stay the same
        window.style.height = '22px';
    } else {
        // Restore from minimized state
        window.classList.remove('minimized');
        
        // Restore dimensions
        window.style.height = window.dataset.restoreHeight;
        
        // Bring window to front
        bringToFront(window);
    }
}

// Toggle window zoom (maximize/restore)
function toggleZoom(window) {
    if (window.dataset.isZoomed === 'true') {
        // Restore
        window.style.left = window.dataset.preZoomLeft;
        window.style.top = window.dataset.preZoomTop;
        window.style.width = window.dataset.preZoomWidth;
        window.style.height = window.dataset.preZoomHeight;
        window.dataset.isZoomed = 'false';
    } else {
        // Save current dimensions
        window.dataset.preZoomLeft = window.style.left;
        window.dataset.preZoomTop = window.style.top;
        window.dataset.preZoomWidth = window.style.width || '400px';
        window.dataset.preZoomHeight = window.style.height || '300px';
        
        // Maximize
        const desktop = document.querySelector('.desktop');
        const menuBarHeight = document.querySelector('.menu-bar').offsetHeight;
        const desktopRect = desktop.getBoundingClientRect();
        
        window.style.left = '0';
        window.style.top = `${menuBarHeight}px`;
        window.style.width = `${desktopRect.width}px`;
        window.style.height = `${desktopRect.height - menuBarHeight}px`;
        window.dataset.isZoomed = 'true';
    }
}

// Menu bar functionality
function initializeMenus() {
    const menuItems = document.querySelectorAll('.menu-item');
    const dropdowns = document.querySelectorAll('.dropdown');
    const appleMenu = document.querySelector('.apple-menu');
    
    // Hide all dropdowns initially
    dropdowns.forEach(dropdown => {
        dropdown.style.display = 'none';
    });
    
    // Show menu when clicking a menu item
    function showMenu(menuItem) {
        // Get the dropdown for this menu item
        const dropdown = menuItem.querySelector('.dropdown');
        
        // Hide all other dropdowns
        dropdowns.forEach(d => {
            if (d !== dropdown) d.style.display = 'none';
        });
        
        // Show this dropdown
        if (dropdown) {
            dropdown.style.display = 'block';
            isMenuOpen = true;
            activeMenu = menuItem;
        }
    }
    
    // Hide all menus
    function hideAllMenus() {
        dropdowns.forEach(dropdown => {
            dropdown.style.display = 'none';
        });
        isMenuOpen = false;
        activeMenu = null;
    }
    
    // Toggle menus when clicking menu items
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent immediate closing
            
            // If this menu is already open, close it
            if (activeMenu === this && isMenuOpen) {
                hideAllMenus();
            } else {
                // Otherwise show this menu
                showMenu(this);
            }
        });
        
        // Handle hovering between menus when one is open
        item.addEventListener('mouseover', function(e) {
            if (isMenuOpen && activeMenu !== this) {
                showMenu(this);
            }
        });
    });
    
    // Prevent dropdown items from closing the menu when clicked
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
    
    // Set up menu item actions
    setupMenuItemActions();
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function() {
        hideAllMenus();
    });
    
    // Apple menu special handling
    appleMenu.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // Get apple menu dropdown
        const appleDropdown = document.getElementById('apple-menu');
        
        // Hide all other dropdowns
        dropdowns.forEach(d => {
            if (d !== appleDropdown) d.style.display = 'none';
        });
        
        // Toggle apple menu
        if (appleDropdown) {
            if (appleDropdown.style.display === 'block') {
                appleDropdown.style.display = 'none';
                isMenuOpen = false;
                activeMenu = null;
            } else {
                appleDropdown.style.display = 'block';
                isMenuOpen = true;
                activeMenu = appleMenu;
            }
        }
    });
    
    // Handle apple menu hover when menus are open
    appleMenu.addEventListener('mouseover', function(e) {
        if (isMenuOpen && activeMenu !== this) {
            const appleDropdown = document.getElementById('apple-menu');
            
            // Hide all other dropdowns
            dropdowns.forEach(d => {
                if (d !== appleDropdown) d.style.display = 'none';
            });
            
            // Show apple menu
            if (appleDropdown) {
                appleDropdown.style.display = 'block';
                activeMenu = appleMenu;
            }
        }
    });
}

// Setup menu item actions
function setupMenuItemActions() {
    const actionItems = document.querySelectorAll('[data-action]');
    
    actionItems.forEach(item => {
        item.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            
            switch (action) {
                case 'about-this-mac':
                    showAlert('about-mac-alert');
                    break;
                    
                case 'about-portfolio':
                    showAlert('portfolio-alert');
                    break;
                    
                case 'control-panels':
                    openWindow('control-panels-window');
                    break;
                    
                case 'new-folder':
                    createNewFolder();
                    break;
                    
                case 'get-info':
                    showInfoAlert(lastClickedItem);
                    break;
                    
                case 'close-window':
                    if (activeWindow) {
                        closeWindow(activeWindow.id);
                    }
                    break;
                    
                default:
                    showErrorAlert(`The "${this.textContent}" action is not yet implemented.`);
                    break;
            }
            
            // Hide all dropdowns after action
            const dropdowns = document.querySelectorAll('.dropdown');
            dropdowns.forEach(dropdown => {
                dropdown.style.display = 'none';
            });
            
            isMenuOpen = false;
            activeMenu = null;
        });
    });
}

// Context Menu functionality
function initializeContextMenu() {
    const contextMenu = document.getElementById('context-menu');
    const desktop = document.querySelector('.desktop');
    const newFolderOption = document.getElementById('new-folder-option');
    const closeWindowOption = document.getElementById('close-window-option');
    const getInfoOption = document.getElementById('get-info-option');
    
    // Show custom context menu
    desktop.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        
        // Position the menu
        contextMenu.style.left = e.clientX + 'px';
        contextMenu.style.top = e.clientY + 'px';
        contextMenu.style.display = 'block';
        contextMenu.style.zIndex = ++windowZIndex;
    });
    
    // Hide context menu when clicking elsewhere
    document.addEventListener('click', function() {
        contextMenu.style.display = 'none';
    });
    
    // New Folder functionality
    if (newFolderOption) {
        newFolderOption.addEventListener('click', function() {
            createNewFolder();
            contextMenu.style.display = 'none';
        });
    }
    
    // Get Info functionality
    if (getInfoOption) {
        getInfoOption.addEventListener('click', function() {
            showInfoAlert(lastClickedItem);
            contextMenu.style.display = 'none';
        });
    }
    
    // Close Window functionality
    if (closeWindowOption) {
        closeWindowOption.addEventListener('click', function() {
            if (activeWindow) {
                closeWindow(activeWindow.id);
            }
            
            contextMenu.style.display = 'none';
        });
    }
}

// Show custom alert
function showAlert(alertId) {
    const alertWindow = document.getElementById(alertId);
    const overlay = document.getElementById('modal-overlay');
    
    if (alertWindow && overlay) {
        // Show overlay and alert
        overlay.style.display = 'block';
        alertWindow.style.display = 'block';
        
        // Center alert in the viewport (not just desktop area)
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Give alert a chance to render with display:block before measuring
        setTimeout(() => {
            const alertWidth = alertWindow.offsetWidth;
            const alertHeight = alertWindow.offsetHeight;
            
            // Position centered, adjusted to look visually balanced
            alertWindow.style.top = '50%';
            alertWindow.style.left = '50%';
            
            // Bring alert to front (higher than overlay)
            overlay.style.zIndex = windowZIndex + 50;
            alertWindow.style.zIndex = windowZIndex + 100;
            
            // Set up button handlers
            setupAlertButtons(alertWindow, overlay);
        }, 10);
    }
}

// Set up alert button handlers
function setupAlertButtons(alertWindow, overlay) {
    const closeBtn = alertWindow.querySelector('.close-btn');
    const buttons = alertWindow.querySelectorAll('.alert-btn');
    
    // Close button handler
    if (closeBtn) {
        closeBtn.onclick = function() {
            hideAlert(alertWindow, overlay);
        };
    }
    
    // Alert button handlers
    buttons.forEach(button => {
        button.onclick = function() {
            hideAlert(alertWindow, overlay);
        };
    });
}

// Hide alert
function hideAlert(alertWindow, overlay) {
    alertWindow.style.display = 'none';
    overlay.style.display = 'none';
}

// Initialize alert windows
function initializeAlerts() {
    const alerts = document.querySelectorAll('.alert-window');
    const overlay = document.getElementById('modal-overlay');
    
    // Pre-setup all alert buttons
    alerts.forEach(alert => {
        setupAlertButtons(alert, overlay);
    });
    
    // Set up specific alert actions
    const portfolioOkBtn = document.getElementById('portfolio-ok-btn');
    const aboutMacOkBtn = document.getElementById('about-mac-ok-btn');
    const infoOkBtn = document.getElementById('info-ok-btn');
    const errorOkBtn = document.getElementById('error-ok-btn');
    
    if (portfolioOkBtn) {
        portfolioOkBtn.addEventListener('click', function() {
            hideAlert(document.getElementById('portfolio-alert'), overlay);
        });
    }
    
    if (aboutMacOkBtn) {
        aboutMacOkBtn.addEventListener('click', function() {
            hideAlert(document.getElementById('about-mac-alert'), overlay);
        });
    }
    
    if (infoOkBtn) {
        infoOkBtn.addEventListener('click', function() {
            hideAlert(document.getElementById('get-info-alert'), overlay);
        });
    }
    
    if (errorOkBtn) {
        errorOkBtn.addEventListener('click', function() {
            hideAlert(document.getElementById('error-alert'), overlay);
        });
    }
}

// Show info alert
function showInfoAlert(item) {
    const infoAlert = document.getElementById('get-info-alert');
    const overlay = document.getElementById('modal-overlay');
    
    if (infoAlert) {
        // Update info content based on the item
        const contentP = infoAlert.querySelector('.alert-content p');
        
        if (item) {
            const itemName = item.querySelector('span') ? item.querySelector('span').textContent : 'Unknown';
            const now = new Date();
            const dateStr = now.toLocaleDateString();
            
            contentP.innerHTML = `
                <strong>Name:</strong> ${itemName}<br>
                <strong>Kind:</strong> Folder<br>
                <strong>Created:</strong> ${dateStr}<br>
                <strong>Modified:</strong> ${dateStr}<br>
                <strong>Size:</strong> 0 bytes (0 bytes on disk)
            `;
        } else {
            contentP.innerHTML = `
                <strong>Name:</strong> Desktop<br>
                <strong>Kind:</strong> Folder<br>
                <strong>Where:</strong> Mac OS 9<br>
                <strong>Created:</strong> System<br>
                <strong>Modified:</strong> Today
            `;
        }
        
        // Show the alert
        showAlert('get-info-alert');
    }
}

// Show error alert
function showErrorAlert(message) {
    const errorAlert = document.getElementById('error-alert');
    
    if (errorAlert) {
        // Update error message
        const errorMessage = errorAlert.querySelector('#error-message');
        if (errorMessage) {
            errorMessage.textContent = message;
        }
        
        // Show the alert
        showAlert('error-alert');
    }
}

// Create new folder function
function createNewFolder() {
    folderCounter++;
    
    // Clone the template
    const template = document.querySelector('.desktop-folder-template');
    const newFolder = template.cloneNode(true);
    newFolder.classList.add('desktop-folder');
    newFolder.classList.add('icon');
    newFolder.classList.remove('desktop-folder-template');
    newFolder.style.display = 'flex';
    
    // Position the folder
    const desktop = document.querySelector('.desktop');
    const topPosition = 40 + (Math.floor(folderCounter / 3) * 90);
    const leftPosition = 120 + ((folderCounter % 3) * 90);
    
    newFolder.style.top = topPosition + 'px';
    newFolder.style.left = leftPosition + 'px';
    
    // Set folder name
    const folderName = `Untitled Folder ${folderCounter > 1 ? folderCounter : ''}`;
    newFolder.querySelector('span').textContent = folderName;
    newFolder.querySelector('input').value = folderName;
    
    // Add event listeners
    const folderNameSpan = newFolder.querySelector('span');
    const folderNameInput = newFolder.querySelector('input');
    
    // Make folder selectable
    newFolder.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // Deselect all folders
        document.querySelectorAll('.desktop-folder').forEach(f => {
            f.classList.remove('selected');
        });
        
        // Select this folder
        this.classList.add('selected');
        lastClickedItem = this;
    });
    
    // Rename on double-click
    folderNameSpan.addEventListener('dblclick', function(e) {
        e.stopPropagation();
        
        // Hide span, show input
        folderNameSpan.style.display = 'none';
        folderNameInput.style.display = 'block';
        folderNameInput.focus();
        folderNameInput.select();
    });
    
    // Save name on blur or enter
    folderNameInput.addEventListener('blur', function() {
        saveNewFolderName(folderNameSpan, folderNameInput);
    });
    
    folderNameInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            saveNewFolderName(folderNameSpan, folderNameInput);
        }
    });
    
    // Add folder to desktop
    desktop.appendChild(newFolder);
}

// Helper function to save folder name
function saveNewFolderName(span, input) {
    span.textContent = input.value || 'Untitled Folder';
    span.style.display = 'block';
    input.style.display = 'none';
}

// Initialize font loading
function initializeFonts() {
    // Only initialize fonts for desktop mode
    if (isMobile) return;
    
    // Add a class to show we're loading fonts
    document.documentElement.classList.add('fonts-loading');
    
    // Check if FontFaceObserver is available
    if (typeof FontFaceObserver !== 'undefined') {
        const charcoal = new FontFaceObserver('Charcoal');
        const geneva = new FontFaceObserver('geneva-9');
        
        // Load both fonts with a timeout to prevent hanging
        Promise.all([
            charcoal.load(null, 5000),  // 5 second timeout
            geneva.load(null, 5000)
        ]).then(() => {
            console.log('Fonts loaded successfully');
            document.documentElement.classList.remove('fonts-loading');
            document.documentElement.classList.add('fonts-loaded');
        }).catch(err => {
            console.log('Font loading error:', err);
            // Add the class anyway to avoid interface issues
            document.documentElement.classList.remove('fonts-loading');
            document.documentElement.classList.add('fonts-loaded');
        });
    } else {
        // No FontFaceObserver, assume fonts are loaded after a delay
        setTimeout(() => {
            document.documentElement.classList.remove('fonts-loading');
            document.documentElement.classList.add('fonts-loaded');
        }, 1000);
    }
}

// Initialize desktop
function initializeDesktop() {
    // Get references after DOM is fully loaded
    dragOutline = document.getElementById('window-drag-outline');
    resizeOutline = document.getElementById('window-resize-outline');
    const menuBar = document.querySelector('.menu-bar');
    if (menuBar) {
        menuBarHeight = menuBar.offsetHeight;
    }
    
    // Initialize desktop icons
    initializeIcons();
} 