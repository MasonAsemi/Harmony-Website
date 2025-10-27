import { useEffect, useRef } from "react";

export function FallingAnimation() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas size
        const updateCanvasSize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        };
        updateCanvasSize();
        window.addEventListener("resize", updateCanvasSize);

        // Create particles
        const particles = [];
        const particleCount = 30;

        for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            speed: 1 + Math.random() * 2,
            drift: (Math.random() - 0.5) * 0.5,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 2,
            type: Math.random() > 0.5 ? "heart" : "note",
            size: 20 + Math.random() * 15,
        });
        }

        // Draw heart
        const drawHeart = (ctx, x, y, size) => {
        ctx.beginPath();
        const topCurveHeight = size * 0.3;
        ctx.moveTo(x, y + topCurveHeight);
        // Left curve
        ctx.bezierCurveTo(
            x, y, 
            x - size / 2, y, 
            x - size / 2, y + topCurveHeight
        );
        ctx.bezierCurveTo(
            x - size / 2, y + (size + topCurveHeight) / 2, 
            x, y + (size + topCurveHeight) / 2, 
            x, y + size
        );
        // Right curve
        ctx.bezierCurveTo(
            x, y + (size + topCurveHeight) / 2, 
            x + size / 2, y + (size + topCurveHeight) / 2, 
            x + size / 2, y + topCurveHeight
        );
        ctx.bezierCurveTo(
            x + size / 2, y, 
            x, y, 
            x, y + topCurveHeight
        );
        ctx.closePath();
        ctx.fill();
        };

        // Draw music note
        const drawMusicNote = (ctx, x, y, size) => {
        ctx.beginPath();
        // Note head (ellipse)
        ctx.ellipse(x, y + size * 0.7, size * 0.25, size * 0.2, -0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Note stem
        ctx.fillRect(x + size * 0.18, y + size * 0.15, size * 0.08, size * 0.6);
        
        // Note flag
        ctx.beginPath();
        ctx.moveTo(x + size * 0.26, y + size * 0.15);
        ctx.quadraticCurveTo(
            x + size * 0.5, y + size * 0.2,
            x + size * 0.26, y + size * 0.4
        );
        ctx.fill();
        };

        // Animation loop
        let animationFrameId;
        const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((particle) => {
            ctx.save();
            ctx.translate(particle.x, particle.y);
            ctx.rotate((particle.rotation * Math.PI) / 180);
            
            ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
            
            if (particle.type === "heart") {
            drawHeart(ctx, 0, 0, particle.size);
            } else {
            drawMusicNote(ctx, 0, 0, particle.size);
            }
            
            ctx.restore();

            // Update position
            particle.y += particle.speed;
            particle.x += particle.drift;
            particle.rotation += particle.rotationSpeed;

            // Reset when off screen
            if (particle.y > canvas.height) {
            particle.y = -50;
            particle.x = Math.random() * canvas.width;
            }
            if (particle.x > canvas.width) {
            particle.x = 0;
            } else if (particle.x < 0) {
            particle.x = canvas.width;
            }
        });

        animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
        window.removeEventListener("resize", updateCanvasSize);
        cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1 }}
        />
    );
}
