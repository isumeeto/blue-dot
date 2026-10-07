import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const formLogin = document.getElementById('form-login');
    const formSignup = document.getElementById('form-signup');
    const btnLogin = document.getElementById('btn-login');
    const btnSignup = document.getElementById('btn-signup');
    const loginError = document.getElementById('login-error');
    const signupError = document.getElementById('signup-error');
    const signupSuccess = document.getElementById('signup-success');
    
    const loginEmail = document.getElementById('login-email');
    const loginPassword = document.getElementById('login-password');
    const signupEmail = document.getElementById('signup-email');
    const signupPassword = document.getElementById('signup-password');
    const signupConfirm = document.getElementById('signup-confirm');
    
    const btnProfile = document.getElementById('btn-profile');
    const iconProfile = document.getElementById('icon-profile');
    const textProfile = document.getElementById('text-profile');
    
    const authFormsContainer = document.getElementById('auth-forms-container');
    const authLoggedInContainer = document.getElementById('auth-logged-in-container');

    // Authentication State Management
    let currentUser = null;

    async function checkUser() {
        const { data: { session } } = await supabase.auth.getSession();
        updateProfileIcon(session?.user || null);
        if (session?.user) {
            await loadUserProfile(session.user);
            if (window.currentScreen === 'direction' && window.checkDirectionState) {
                window.checkDirectionState();
            }
        }
        
        // Listen for auth changes
        supabase.auth.onAuthStateChange(async (event, session) => {
            updateProfileIcon(session?.user || null);
            if (session?.user) {
                await loadUserProfile(session.user);
            }
            
            if (event === 'SIGNED_IN') {
                 if (window.currentScreen === 'auth' || window.currentScreen === 'onboarding') {
                     if (window.goTo) window.goTo('direction');
                 }
            } else if (event === 'SIGNED_OUT') {
                 if (window.goTo) window.goTo('onboarding');
            }
        });
    }

    let currentAvatarUrl = null;

    function updateProfileIcon(user) {
        currentUser = user;
        const iconProfileImg = document.getElementById('icon-profile-img') || (() => {
            const img = document.createElement('img');
            img.id = 'icon-profile-img';
            img.alt = 'Profile';
            img.className = 'w-10 h-10 rounded-full object-cover hidden';
            iconProfile.after(img);
            return img;
        })();

        if (user) {
            textProfile.textContent = 'Profile';
            textProfile.classList.remove('hidden');
            if (authFormsContainer) authFormsContainer.classList.add('hidden');
            if (authLoggedInContainer) authLoggedInContainer.classList.remove('hidden');
            
            if (currentAvatarUrl) {
                iconProfile.classList.add('hidden');
                iconProfileImg.src = currentAvatarUrl;
                iconProfileImg.classList.remove('hidden');
            } else {
                iconProfile.textContent = 'account_circle';
                iconProfile.classList.remove('hidden');
                iconProfileImg.classList.add('hidden');
            }
        } else {
            iconProfile.textContent = 'account_circle';
            iconProfile.classList.remove('hidden');
            iconProfileImg.classList.add('hidden');
            textProfile.textContent = '';
            textProfile.classList.add('hidden');
            if (authFormsContainer) authFormsContainer.classList.remove('hidden');
            if (authLoggedInContainer) authLoggedInContainer.classList.add('hidden');
        }
    }

    // ── Profile Screen Logic ────────────────────────────────────
    const profileBtnLogout = document.getElementById('profile-btn-logout');
    const profileCurrentAvatarIcon = document.getElementById('profile-current-avatar-icon');
    const profileCurrentAvatarImg = document.getElementById('profile-current-avatar-img');
    const presetAvatarBtns = document.querySelectorAll('.preset-avatar-btn');
    const btnUploadProfile = document.getElementById('btn-upload-profile');
    const profileUploadInput = document.getElementById('profile-upload-input');
    const profileNameInput = document.getElementById('profile-name-input');
    const profileEmailInput = document.getElementById('profile-email-input');
    const btnSaveProfile = document.getElementById('btn-save-profile');

    async function loadUserProfile(user) {
        if (!user) return;
        if (profileEmailInput) profileEmailInput.value = user.email;
        
        // Fetch user from users table to get the name
        const { data, error } = await supabase.from('users').select('name').eq('id', user.id).single();
        if (!error && data) {
            if (profileNameInput) profileNameInput.value = data.name || '';
        }
    }

    function setAvatar(url) {
        currentAvatarUrl = url;
        if (profileCurrentAvatarIcon) profileCurrentAvatarIcon.classList.add('hidden');
        if (profileCurrentAvatarImg) {
            profileCurrentAvatarImg.src = url;
            profileCurrentAvatarImg.classList.remove('hidden');
        }
        updateProfileIcon(currentUser);
    }

    if (btnSaveProfile) {
        btnSaveProfile.addEventListener('click', async () => {
            if (!currentUser) return;
            const newName = profileNameInput.value;
            const btnOriginalText = btnSaveProfile.textContent;
            btnSaveProfile.textContent = 'Saving...';
            btnSaveProfile.disabled = true;
            
            await supabase.from('users').update({ name: newName }).eq('id', currentUser.id);
            
            btnSaveProfile.textContent = 'Saved!';
            setTimeout(() => {
                btnSaveProfile.textContent = btnOriginalText;
                btnSaveProfile.disabled = false;
            }, 2000);
        });
    }

    if (profileBtnLogout) {
        profileBtnLogout.addEventListener('click', async () => {
            await supabase.auth.signOut();
            currentAvatarUrl = null; 
            updateProfileIcon(null);
            if (profileNameInput) profileNameInput.value = '';
            if (profileEmailInput) profileEmailInput.value = '';
            
            if (window.goTo) window.goTo('onboarding');
        });
    }

    presetAvatarBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const src = btn.getAttribute('data-src');
            if (src) setAvatar(src);
        });
    });

    if (btnUploadProfile && profileUploadInput) {
        btnUploadProfile.addEventListener('click', () => {
            profileUploadInput.click();
        });
        
        profileUploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    setAvatar(event.target.result);
                };
                reader.readAsDataURL(file);
            }
        });
    }
    // ───────────────────────────────────────────────────────────

    // Login Form Submit
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginError.classList.add('hidden');
        btnLogin.textContent = 'Logging in...';
        btnLogin.disabled = true;

        const { data, error } = await supabase.auth.signInWithPassword({
            email: loginEmail.value,
            password: loginPassword.value
        });

        btnLogin.textContent = 'Log In';
        btnLogin.disabled = false;

        if (error) {
            loginError.textContent = error.message;
            loginError.classList.remove('hidden');
        } else {
            // Success! Go to dashboard/direction
            loginEmail.value = '';
            loginPassword.value = '';
            if (window.goTo) window.goTo('direction');
        }
    });

    // Signup Form Submit
    formSignup.addEventListener('submit', async (e) => {
        e.preventDefault();
        signupError.classList.add('hidden');
        signupSuccess.classList.add('hidden');
        
        if (signupPassword.value !== signupConfirm.value) {
            signupError.textContent = "Passwords do not match.";
            signupError.classList.remove('hidden');
            return;
        }

        btnSignup.textContent = 'Signing up...';
        btnSignup.disabled = true;

        console.log("=========================================");
        console.log("🚀 SUPABASE SIGNUP CALL INITIATED");
        console.log("Attempting to sign up user with email:", signupEmail.value);
        console.log("=========================================");
        
        const { data, error } = await supabase.auth.signUp({
            email: signupEmail.value,
            password: signupPassword.value
        });
        
        console.log("=========================================");
        console.log("✅ SUPABASE SIGNUP CALL COMPLETED");
        console.log("Sign up response data:", data);
        
        if (error) {
            console.error("❌ Sign up returned an error:", error);
            console.error("Error Message:", error.message);
            console.log("=========================================");
            signupError.textContent = error.message;
            signupError.classList.remove('hidden');
            btnSignup.textContent = 'Sign Up';
            btnSignup.disabled = false;
            return;
        } else {
            console.log("No error returned from signUp.");
            console.log("=========================================");
        }

        // If signup is successful, add to users table
        if (data.user) {
            // Wait for the session to be fully established in the client so RLS passes
            await supabase.auth.getSession();
            
            console.log("Attempting to insert user row into 'users' table:", { id: data.user.id, email: data.user.email });
            const { error: insertError } = await supabase.from('users').insert({
                id: data.user.id,
                email: data.user.email
            });
            
            if (insertError) {
                console.error("Error inserting into users table:", insertError);
            } else {
                console.log("Successfully inserted row into users table!");
            }
        } else {
            console.log("No user object returned in signup data, skipping insert to users table.");
        }

        signupSuccess.textContent = "Sign up successful! You are now logged in.";
        signupSuccess.classList.remove('hidden');
        btnSignup.textContent = 'Sign Up';
        btnSignup.disabled = false;
        
        signupEmail.value = '';
        signupPassword.value = '';
        signupConfirm.value = '';
        
        // Wait a short time then go to direction screen
        setTimeout(() => {
            if (window.goTo) window.goTo('direction');
        }, 1500);
    });

    // Initialize
    checkUser();
    
    // Global functions
    window.saveDailyLogStatus = async (status) => {
        if (!currentUser) {
            console.log("Cannot save daily log: User not logged in.");
            return;
        }
        
        console.log("Saving daily log status:", status);
        const today = new Date().toISOString().split('T')[0];
        
        const { data, error } = await supabase.from('daily_logs').insert({
            user_id: currentUser.id,
            log_date: today,
            status: status
        });
        
        if (error) {
            console.error("Error saving daily log:", error);
        } else {
            console.log("Successfully saved daily log:", status);
        }
    };
    window.savePulseReflection = async (nextStep) => {
        if (!currentUser) {
            console.log("Cannot save pulse reflection: User not logged in.");
            return;
        }
        
        console.log("Saving pulse reflection:", nextStep);
        
        const enjoymentVal = document.getElementById('enjoyment-slider')?.value || null;
        const difficultyVal = document.getElementById('difficulty-slider')?.value || null;
        const completionVal = document.querySelector('input[name="progress"]:checked')?.value || null;
        const surpriseVal = document.getElementById('surprise-notes')?.value || null;

        const { data, error } = await supabase.from('pulse_checks').insert({
            user_id: currentUser.id,
            next_step_choice: nextStep,
            enjoyment: enjoymentVal,
            difficulty: difficultyVal,
            completion_amount: completionVal,
            surprise_notes: surpriseVal
        });
        
        if (error) {
            console.error("Error saving pulse reflection:", error);
        } else {
            console.log("Successfully saved pulse reflection:", nextStep);
        }
    };
    // -- Save User Context (from Onboarding page) ---------------------
    window.saveUserContext = async (situation, feelings) => {
        if (!currentUser) {
            console.log("Cannot save user context: User not logged in.");
            return;
        }
        
        console.log("Saving user context...");
        
        const { data, error } = await supabase.from('user_context').insert({
            user_id: currentUser.id,
            current_situation: situation,
            current_feelings: feelings
        });
        
        if (error) {
            console.error("Error saving user context:", error);
        } else {
            console.log("Successfully saved user context");
        }
    };

    // -- Save Weekly Plan Direction (from Direction page) ---------------------
    window.saveWeeklyPlanDirection = async (direction) => {
        if (!currentUser) {
            console.log("Cannot save weekly plan direction: User not logged in.");
            return;
        }
        const { data, error } = await supabase.from('weekly_plans').insert({
            user_id: currentUser.id,
            week_number: 1,
            direction_chosen: direction,
            task_description: "Starting exploration for " + direction
        });
        if (error) console.error('Error saving weekly plan direction:', error);
        else console.log('Successfully saved weekly plan direction');
    };

    // -- Update Weekly Plan Task (from Plan page) ----------------------
    window.updateWeeklyPlanTask = async (taskDesc) => {
        if (!currentUser) {
            console.log("Cannot update weekly plan task: User not logged in.");
            return;
        }
        const { data, error } = await supabase.from('weekly_plans')
            .update({ task_description: taskDesc })
            .eq('user_id', currentUser.id)
            .eq('week_number', 1);
        if (error) console.error('Error updating weekly plan task:', error);
        else console.log('Successfully updated weekly plan task');
    };
    
    // -- Check Direction State (from Direction page) -------------------
    window.checkDirectionState = async () => {
        if (!currentUser) return;
        
        try {
            // 1. Get latest weekly plan
            const { data: plans, error: planError } = await supabase
                .from('weekly_plans')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false })
                .limit(1);
                
            if (planError) throw planError;
            
            const latestPlan = plans && plans.length > 0 ? plans[0] : null;
            
            // 2. Get latest pulse check
            const { data: pulses, error: pulseError } = await supabase
                .from('pulse_checks')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false })
                .limit(1);
                
            if (pulseError) throw pulseError;
            
            const latestPulse = pulses && pulses.length > 0 ? pulses[0] : null;
            
            let isLocked = false;
            let chosenDirection = '';
            
            if (latestPlan) {
                isLocked = true;
                chosenDirection = latestPlan.direction_chosen;
                
                // If there's a newer pulse check with 'switch', it's unlocked
                if (latestPulse) {
                    const planDate = new Date(latestPlan.created_at);
                    const pulseDate = new Date(latestPulse.created_at);
                    
                    if (pulseDate > planDate && latestPulse.next_step_choice === 'switch') {
                        isLocked = false;
                    }
                }
            }
            
            // Update UI
            const optionsView = document.getElementById('direction-options-view');
            const lockedView = document.getElementById('direction-locked-view');
            const lockedName = document.getElementById('locked-direction-name');
            
            if (optionsView && lockedView && lockedName) {
                if (isLocked) {
                    optionsView.classList.add('hidden');
                    lockedView.classList.remove('hidden');
                    lockedView.classList.add('flex');
                    lockedName.textContent = chosenDirection;
                } else {
                    optionsView.classList.remove('hidden');
                    lockedView.classList.add('hidden');
                    lockedView.classList.remove('flex');
                }
            }
            
        } catch (err) {
            console.error('Error checking direction state:', err);
        }
    };
});

