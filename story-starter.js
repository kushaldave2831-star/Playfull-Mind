document.addEventListener('DOMContentLoaded', () => {
    class StoryStarter {
        constructor(manager) {
            this.mgr = manager;
            
            this.storyPrompt = document.getElementById('story-prompt');
            this.storyOutput = document.getElementById('story-output').querySelector('p');
            this.generateStoryBtn = document.getElementById('generate-story-btn');
            this.apiKeyModal = document.getElementById('api-key-modal');
            this.apiKeyInput = document.getElementById('api-key-input');
            this.saveApiKeyBtn = document.getElementById('save-api-key-btn');
            
            this.apiKey = localStorage.getItem('gemini-api-key') || '';

            if (this.generateStoryBtn) {
                this.generateStoryBtn.addEventListener('click', () => this.handleGenerate());
            }

            if (this.saveApiKeyBtn) {
                this.saveApiKeyBtn.addEventListener('click', () => this.saveApiKey());
            }
        }

        showApiKeyModal() {
            if (this.apiKeyModal) {
                this.apiKeyModal.classList.remove('hidden');
                this.apiKeyModal.classList.add('flex');
            }
        }

        hideApiKeyModal() {
            if (this.apiKeyModal) {
                this.apiKeyModal.classList.add('hidden');
                this.apiKeyModal.classList.remove('flex');
            }
        }

        saveApiKey() {
            const key = this.apiKeyInput.value.trim();
            if (key) {
                this.apiKey = key;
                localStorage.setItem('gemini-api-key', key);
                this.hideApiKeyModal();
                this.handleGenerate();
            } else {
                alert("Please enter a valid API key.");
            }
        }

        async handleGenerate() {
            if (!this.apiKey) {
                this.showApiKeyModal();
                return;
            }

            const userPrompt = this.storyPrompt.value.trim();
            if (!userPrompt) {
                this.mgr.speak("Please enter a prompt for the story.");
                this.storyOutput.textContent = 'Please enter a prompt for the story.';
                return;
            }

            this.storyOutput.textContent = 'Thinking of a magical story for you...';
            this.generateStoryBtn.disabled = true;
            this.generateStoryBtn.classList.add('opacity-50', 'cursor-not-allowed');
            this.mgr.setCharacterExpression('thinking');

            try {
                // Using Gemini 1.5 Flash as it's more stable/available for free tier
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
                
                const payload = { 
                    contents: [{ 
                        parts: [{ text: `Write a short, fun, and educational story for a child based on this prompt: ${userPrompt}. Keep it under 150 words.` }]
                    }]
                };
                
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    if (response.status === 400 || response.status === 401) {
                        localStorage.removeItem('gemini-api-key');
                        this.apiKey = '';
                        throw new Error('Invalid API key. Please check your key and try again.');
                    }
                    throw new Error('Magic failed! The story wizards are busy. Try again later.');
                }

                const result = await response.json();
                
                if (result.candidates && result.candidates[0].content.parts[0].text) {
                    const generatedText = result.candidates[0].content.parts[0].text;
                    this.storyOutput.textContent = generatedText;
                    this.mgr.setCharacterExpression('happy');
                    this.mgr.speak("I have a story for you!");
                    this.mgr.addScore(2); // Reward for creativity!
                } else {
                    throw new Error("The wizards couldn't think of anything. Try a different prompt!");
                }

            } catch (error) {
                console.error('Error generating story:', error);
                this.storyOutput.textContent = error.message;
                this.mgr.setCharacterExpression('sad');
            } finally {
                this.generateStoryBtn.disabled = false;
                this.generateStoryBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }
    }

    const storyApp = new StoryStarter(window.gameManager);
});