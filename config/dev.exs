# Configuration pour l'environnement de développement
import Config

# Configuration de l'endpoint en développement
config :phenix_test, PhenixTestWeb.Endpoint,
  # Port d'écoute pour le serveur de développement
  http: [
    ip: {127, 0, 0, 1},
    port: 4000
  ],
  # Configuration pour le rechargement automatique
  check_origin: false,
  code_reloader: true,
  debug_errors: true,
  secret_key_base: "your-secret-key-base-for-development-only",
  watchers: [
    esbuild: {Esbuild, :install_and_run, [:default, ~w(--sourcemap=inline)]},
    tailwind: {Tailwind, :install_and_run, [:default, ~w(--watch)]}
  ]

# Configuration de la base de données en développement
# config :phenix_test, PhenixTest.Repo,
#   username: "postgres",
#   password: "postgres",
#   hostname: "localhost",
#   database: "phenix_test_dev",
#   stacktrace: true,
#   show_sensitive_data_on_connection_error: true,
#   pool_size: 10

# Configuration des logs en développement
config :logger, :console, format: "[$level] $message\n"

# Configuration de l'importation des modules en développement
config :phoenix, :stacktrace_depth, 20
config :phoenix, :plug_init_mode, :runtime 