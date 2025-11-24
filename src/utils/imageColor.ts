export const getDominantColor = (imageUrl: string, darkenPercentage: number = 0): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = imageUrl;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve('#ffffff');
                return;
            }

            // We want to sample the top 20% of the image
            // We'll draw that portion into a 1x1 canvas to let the browser average it
            canvas.width = 1;
            canvas.height = 1;

            // Smoothing options
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'medium';

            // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
            // Source: Top 20% (0, 0, width, height * 0.2)
            // Dest: 1x1 pixel
            ctx.drawImage(img, 0, 0, img.width, img.height * 0.2, 0, 0, 1, 1);

            try {
                let [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;

                // Apply darken effect
                // darkenPercentage is 0-100. If 50, we want to reduce brightness by 50%
                // The formula is effectively mixing with black: color * (1 - darken/100)
                if (darkenPercentage > 0) {
                    const factor = 1 - (darkenPercentage / 100);
                    r = Math.round(r * factor);
                    g = Math.round(g * factor);
                    b = Math.round(b * factor);
                }

                // Convert to hex for consistency
                const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
                resolve(hex);
            } catch (e) {
                console.error("Error getting image data", e);
                resolve('#ffffff');
            }
        };

        img.onerror = () => {
            console.error("Error loading image for color extraction");
            resolve('#ffffff');
        };
    });
};
