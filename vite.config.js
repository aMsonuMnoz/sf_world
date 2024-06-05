

export default{
    root: '.', // Sources files (typically where index.html is)
    publicDir: 'static/', // Path from "root" to static assets (files that are served as they are)
    build:
    {
        outDir: '../dist', // Output in the dist/ folder
        emptyOutDir: true, // Empty the folder first
        sourcemap: true // Add sourcemap
    },
    server: {
        proxy: {
          '/api': 'http://localhost:3000',
          '/socket.io': {
            target: 'http://localhost:3000',
            ws: true
          }
        }
      }
}

