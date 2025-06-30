import { MovieBookingSDK } from './MovieBookingSDK';
import { SDKOptions, MovieConfig, ThemeConfig } from '../types';
import { generateUniqueId } from '../utils';

interface IntegrationOptions extends Partial<SDKOptions> {
  movieId: string;
  containerId?: string;
  theme?: string | Partial<ThemeConfig>;
  autoInit?: boolean;
  responsive?: boolean;
  mobileOptimized?: boolean;
}

interface EmbedOptions {
  movieId: string;
  width?: string;
  height?: string;
  theme?: string;
  showPoweredBy?: boolean;
  autoplay?: boolean;
}

export class MovieBookingIntegration {
  private sdk: MovieBookingSDK;
  private container: HTMLElement | null = null;
  private widgetId: string;
  private options: IntegrationOptions;

  constructor(options: IntegrationOptions) {
    this.options = {
      autoInit: true,
      responsive: true,
      mobileOptimized: true,
      ...options
    };

    this.widgetId = generateUniqueId();
    
    if (!options.apiKey) {
      throw new Error('API key is required for integration');
    }

    this.sdk = new MovieBookingSDK(options as SDKOptions);

    if (this.options.autoInit) {
      this.init();
    }
  }

  async init(): Promise<void> {
    try {
      // Find or create container
      if (this.options.containerId) {
        this.container = document.getElementById(this.options.containerId);
        if (!this.container) {
          throw new Error(`Container with ID '${this.options.containerId}' not found`);
        }
      } else {
        this.container = document.body;
      }

      // Load movie configuration
      const movieConfig = await this.sdk.getMovieConfig(this.options.movieId);
      
      // Apply theme if provided
      if (this.options.theme) {
        if (typeof this.options.theme === 'string') {
          const presets = await this.sdk.getCustomizationPresets();
          const preset = presets.find(p => p.name.toLowerCase() === this.options.theme?.toLowerCase());
          if (preset) {
            this.sdk.updateTheme(preset.theme);
          }
        } else {
          this.sdk.updateTheme(this.options.theme);
        }
      }

      // Create widget
      this.createWidget(movieConfig);

      // Apply responsive styles
      if (this.options.responsive) {
        this.applyResponsiveStyles();
      }

      // Optimize for mobile if needed
      if (this.options.mobileOptimized && this.sdk.isMobile()) {
        this.sdk.optimizeForMobile();
        this.applyMobileStyles();
      }

    } catch (error) {
      console.error('Integration initialization failed:', error);
      this.showError(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private createWidget(movieConfig: MovieConfig): void {
    if (!this.container) return;

    // Create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.id = this.widgetId;
    widgetContainer.className = 'movie-booking-widget-container';
    
    // Apply initial styles
    this.applyWidgetStyles(widgetContainer, movieConfig);

    // Create React mounting point
    const reactMount = document.createElement('div');
    reactMount.id = `${this.widgetId}-react`;
    widgetContainer.appendChild(reactMount);

    // Add to container
    this.container.appendChild(widgetContainer);

    // Initialize React component (if React is available)
    this.mountReactComponent(reactMount, movieConfig);
  }

  private applyWidgetStyles(container: HTMLElement, movieConfig: MovieConfig): void {
    const styles = `
      .movie-booking-widget-container {
        width: 100%;
        background-color: ${movieConfig.background_color};
        color: ${movieConfig.text_color};
        font-family: ${movieConfig.typography.font_family};
        line-height: 1.6;
        box-sizing: border-box;
      }
      
      .movie-booking-widget-container * {
        box-sizing: border-box;
      }
    `;

    // Add styles to document
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);

    // Apply container class
    container.className = 'movie-booking-widget-container';
  }

  private applyResponsiveStyles(): void {
    const responsiveStyles = `
      @media (max-width: 768px) {
        .movie-booking-widget-container {
          font-size: 14px;
        }
        
        .movie-hero h1 {
          font-size: 2rem !important;
        }
        
        .theater-card {
          margin-bottom: 1rem;
        }
      }
      
      @media (max-width: 480px) {
        .movie-booking-widget-container {
          font-size: 13px;
        }
        
        .movie-hero {
          padding: 1rem;
        }
        
        .theater-listings {
          padding: 0.5rem;
        }
      }
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = responsiveStyles;
    document.head.appendChild(styleElement);
  }

  private applyMobileStyles(): void {
    const mobileStyles = `
      .movie-booking-widget-container {
        touch-action: manipulation;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        user-select: none;
      }
      
      .theater-card,
      .booking-button {
        min-height: 44px;
        min-width: 44px;
      }
      
      .movie-hero {
        background-attachment: scroll !important;
      }
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = mobileStyles;
    document.head.appendChild(styleElement);
  }

  private mountReactComponent(container: HTMLElement, movieConfig: MovieConfig): void {
    // Check if React is available
    const React = (window as any).React;
    const ReactDOM = (window as any).ReactDOM;

    if (React && ReactDOM) {
      // Mount React component
      const { MovieBookingWidget } = (window as any).MovieBookingSDK;
      
      ReactDOM.render(
        React.createElement(MovieBookingWidget, {
          movieId: this.options.movieId,
          apiKey: this.options.apiKey,
          mobileOptimized: this.options.mobileOptimized,
          onBookingComplete: (booking: any) => {
            this.handleBookingComplete(booking);
          },
          onError: (error: Error) => {
            this.handleError(error);
          }
        }),
        container
      );
    } else {
      // Fallback to vanilla JS implementation
      this.createVanillaWidget(container, movieConfig);
    }
  }

  private createVanillaWidget(container: HTMLElement, movieConfig: MovieConfig): void {
    container.innerHTML = `
      <div class="movie-hero" style="
        background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${movieConfig.hero_image || ''}');
        background-size: cover;
        background-position: center;
        padding: 3rem 2rem;
        text-align: center;
        color: ${movieConfig.text_color};
      ">
        <h1 style="
          font-size: ${movieConfig.typography.heading_font_size};
          margin-bottom: 1rem;
          color: ${movieConfig.accent_color};
        ">
          ${movieConfig.movie_title}
          ${movieConfig.movie_subtitle ? ` ${movieConfig.movie_subtitle}` : ''}
        </h1>
        <p style="
          font-size: 1.1rem;
          margin-bottom: 2rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        ">
          ${movieConfig.description}
        </p>
        <button class="book-now-btn" style="
          background: ${movieConfig.primary_button.background_color};
          color: ${movieConfig.primary_button.text_color};
          border: none;
          padding: 1rem 2rem;
          font-size: 1.1rem;
          border-radius: ${movieConfig.primary_button.border_radius}px;
          cursor: pointer;
          transition: all 0.3s ease;
        ">
          ${movieConfig.primary_button.emoji || ''} Book Now
        </button>
      </div>
    `;

    // Add event listeners
    const bookButton = container.querySelector('.book-now-btn');
    bookButton?.addEventListener('click', () => {
      this.handleBookNowClick();
    });
  }

  private handleBookingComplete(booking: any): void {
    console.log('Booking completed:', booking);
    
    // Dispatch custom event
    const event = new CustomEvent('movieBookingComplete', {
      detail: booking
    });
    document.dispatchEvent(event);
  }

  private handleBookNowClick(): void {
    console.log('Book now clicked');
    
    // Dispatch custom event
    const event = new CustomEvent('movieBookNowClick', {
      detail: { movieId: this.options.movieId }
    });
    document.dispatchEvent(event);
  }

  private handleError(error: Error): void {
    console.error('Widget error:', error);
    this.showError(error.message);
  }

  private showError(message: string): void {
    if (!this.container) return;

    this.container.innerHTML = `
      <div style="
        padding: 2rem;
        text-align: center;
        background-color: #fee2e2;
        border: 1px solid #fecaca;
        border-radius: 8px;
        color: #dc2626;
      ">
        <h3>Error Loading Movie</h3>
        <p>${message}</p>
      </div>
    `;
  }

  // Public methods
  public updateTheme(theme: Partial<ThemeConfig>): void {
    this.sdk.updateTheme(theme);
    // Re-render if needed
  }

  public destroy(): void {
    if (this.container && this.widgetId) {
      const widget = document.getElementById(this.widgetId);
      if (widget) {
        widget.remove();
      }
    }
    this.sdk.destroy();
  }

  public getSDK(): MovieBookingSDK {
    return this.sdk;
  }
}

// Factory function for easy integration
export const createMovieBookingIntegration = (options: IntegrationOptions): MovieBookingIntegration => {
  return new MovieBookingIntegration(options);
};

// Embed generator
export const generateEmbedCode = (options: EmbedOptions): string => {
  const {
    movieId,
    width = '100%',
    height = '600px',
    theme = 'action',
    showPoweredBy = true,
    autoplay = false
  } = options;

  const params = new URLSearchParams({
    movieId,
    theme,
    showPoweredBy: showPoweredBy.toString(),
    autoplay: autoplay.toString()
  });

  return `<iframe 
    src="https://embed.your-platform.com/movie?${params.toString()}"
    width="${width}"
    height="${height}"
    frameborder="0"
    allowfullscreen
    style="border-radius: 8px;"
  ></iframe>`;
};

// Global initialization for script tag usage
if (typeof window !== 'undefined') {
  (window as any).MovieBookingSDK = {
    createIntegration: createMovieBookingIntegration,
    generateEmbed: generateEmbedCode,
    SDK: MovieBookingSDK
  };
}