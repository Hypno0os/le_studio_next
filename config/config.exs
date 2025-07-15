# Configuration générale de l'application
import Config

config :phenix_test, ecto_repos: [PhenixTest.Repo]

# Configuration de l'endpoint
config :phenix_test, PhenixTestWeb.Endpoint,
  url: [host: "localhost"],
  adapter: Phoenix.Endpoint.Cowboy2Adapter,
  render_errors: [
    formats: [html: PhenixTestWeb.ErrorHTML, json: PhenixTestWeb.ErrorJSON],
    layout: false
  ],
  pubsub_server: PhenixTest.PubSub,
  live_view: [signing_salt: "your-secret-salt-here"]

# Configuration des logs
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Configuration de l'importation des modules
config :phoenix, :json_library, Jason

# Configuration de Petal Components
config :petal_components,
  # Thème par défaut (light ou dark)
  default_theme: "light",
  # Couleurs personnalisées
  colors: [
    primary: "#3B82F6",
    secondary: "#6B7280",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444"
  ]

# Configuration esbuild
config :esbuild,
  version: "0.7.1",
  default: [
    args: ~w(js/app.js --bundle --target=es2017 --outdir=../priv/static/assets),
    cd: Path.expand("../assets", __DIR__)
  ]

# Configuration tailwind
config :tailwind,
  version: "3.3.3",
  default: [
    args: ~w(--config=tailwind.config.js --input=css/app.css --output=../priv/static/assets/app.css),
    cd: Path.expand("../assets", __DIR__)
  ]

# Configuration de l'environnement de développement
import_config "#{config_env()}.exs" 