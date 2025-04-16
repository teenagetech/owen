// Mac OS 9 Desktop Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize System
    initializeClock();
    initializeIcons();
    initializeWindows();
    initializeContextMenu();
    initializeMenus();
    initializeCursors();
    
    // Add system sounds
    const systemSounds = {
        startup: new Audio('sounds/startup.mp3')
    };
    
    // Play startup sound
    try {
        systemSounds.startup.play();
    } catch (e) {
        console.log('Audio not loaded yet, waiting for user interaction');
    }

    // Window management variables
    let activeWindow = null;
    let draggedWindow = null;
    let offsetX, offsetY;
    let isResizing = false;
    let isDragging = false;
    let folderCounter = 0;
    let lastClickedItem = null;
    let windowZIndex = 100;
    let dragOutline = document.getElementById('window-drag-outline');
    let resizeOutline = document.getElementById('window-resize-outline');
    let menuBarHeight = document.querySelector('.menu-bar').offsetHeight;
    let isMenuOpen = false;
    let activeMenu = null;
    
    // Constants for minimum window size
    const MIN_WINDOW_WIDTH = 300;
    const MIN_WINDOW_HEIGHT = 200;
    
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
            
            // Set window to active when clicked
            window.addEventListener('mousedown', () => {
                setActiveWindow(window);
            });
            
            // Handle window dragging
            header.addEventListener('mousedown', (e) => {
                // Don't start dragging if clicking on a control button
                if (e.target.closest('.control-button')) return;
                
                isDragging = true;
                activeWindow = window;
                
                // Set grabbing cursor
                header.style.cursor = 'grabbing';
                
                // Get starting positions
                offsetX = e.clientX;
                offsetY = e.clientY;
                const rect = window.getBoundingClientRect();
                window.initialLeft = rect.left;
                window.initialTop = rect.top;
                
                // Set up the outline
                dragOutline.style.width = `${rect.width}px`;
                dragOutline.style.height = `${rect.height}px`;
                dragOutline.style.left = `${rect.left}px`;
                dragOutline.style.top = `${rect.top}px`;
                dragOutline.style.display = 'block';
                
                playSoundEffect('click');
                e.preventDefault();
            });
            
            // Handle window resizing
            if (resizeHandle) {
                resizeHandle.addEventListener('mousedown', (e) => {
                    isResizing = true;
                    activeWindow = window;
                    
                    // Get starting positions and dimensions
                    const rect = window.getBoundingClientRect();
                    window.initialWidth = rect.width;
                    window.initialHeight = rect.height;
                    window.initialLeft = rect.left;
                    window.initialTop = rect.top;
                    
                    // Set up the resize outline
                    resizeOutline.style.width = `${rect.width}px`;
                    resizeOutline.style.height = `${rect.height}px`;
                    resizeOutline.style.left = `${rect.left}px`;
                    resizeOutline.style.top = `${rect.top}px`;
                    resizeOutline.style.display = 'block';
                    
                    playSoundEffect('click');
                    e.preventDefault();
                });
            }
            
            // Close button functionality
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    closeWindow(window.id);
                    playSoundEffect('close');
                });
            }
            
            // Minimize button functionality
            if (minimizeBtn) {
                minimizeBtn.addEventListener('click', () => {
                    minimizeWindow(window);
                    playSoundEffect('minimize');
                });
            }
            
            // Zoom button functionality
            if (zoomBtn) {
                zoomBtn.addEventListener('click', () => {
                    toggleZoom(window);
                    playSoundEffect('maximize');
                    
                    // Update outline dimensions if window is resized
                    if (isDragging) {
                        dragOutline.style.width = `${window.offsetWidth}px`;
                        dragOutline.style.height = `${window.offsetHeight}px`;
                    }
                });
            }
        });
        
        // Global mouse move handler
        document.addEventListener('mousemove', (e) => {
            if (isDragging && activeWindow) {
                const menuBar = document.querySelector('.menu-bar');
                const menuBarRect = menuBar.getBoundingClientRect();
                
                // Calculate new position
                let newLeft = window.initialLeft + (e.clientX - offsetX);
                let newTop = window.initialTop + (e.clientY - offsetY);
                
                // Ensure window doesn't go outside viewport
                newLeft = Math.max(0, newLeft);
                newTop = Math.max(menuBarRect.height, newTop);
                
                // Update outline position
                dragOutline.style.left = `${newLeft}px`;
                dragOutline.style.top = `${newTop}px`;
            } else if (isResizing && activeWindow) {
                // Calculate new dimensions
                const newWidth = Math.max(200, window.initialWidth + (e.clientX - offsetX));
                const newHeight = Math.max(150, window.initialHeight + (e.clientY - offsetY));
                
                // Update outline dimensions
                resizeOutline.style.width = `${newWidth}px`;
                resizeOutline.style.height = `${newHeight}px`;
            }
        });
        
        // Global mouse up handler
        document.addEventListener('mouseup', (e) => {
            if (isDragging && activeWindow) {
                const header = activeWindow.querySelector('.window-header');
                header.style.cursor = 'grab';
                
                // Check if mouse is over menu bar when released
                const menuBar = document.querySelector('.menu-bar');
                const menuBarRect = menuBar.getBoundingClientRect();
                
                if (e.clientY <= menuBarRect.height) {
                    // Cancel drag if released on menu bar
                    dragOutline.style.display = 'none';
                } else {
                    // Apply new position
                    activeWindow.style.left = dragOutline.style.left;
                    activeWindow.style.top = dragOutline.style.top;
                    
                    // Hide outline
                    dragOutline.style.display = 'none';
                }
                
                isDragging = false;
            } else if (isResizing && activeWindow) {
                // Apply new dimensions
                activeWindow.style.width = resizeOutline.style.width;
                activeWindow.style.height = resizeOutline.style.height;
                
                // Hide outline
                resizeOutline.style.display = 'none';
                
                isResizing = false;
            }
            
            // Reset active window after a small delay (to allow click events to propagate)
            clearTimeout(outlineTimeout);
            outlineTimeout = setTimeout(() => {
                activeWindow = null;
            }, 10);
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
            
            // Ensure window is not minimized when maximizing
            if (window.classList.contains('minimized')) {
                window.classList.remove('minimized');
            }
            
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

    function setActiveWindow(window) {
        // Remove active class from all windows
        document.querySelectorAll('.window').forEach(win => {
            win.classList.remove('active');
            win.style.zIndex = 1;
        });
        
        // Add active class to clicked window
        window.classList.add('active');
        window.style.zIndex = 10;
    }
}); 