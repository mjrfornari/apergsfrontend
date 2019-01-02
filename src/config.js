// export const config = {
//     protocol: 'https',
//     server : 'delphusback.herokuapp.com',
//     port: 3000,
//     portBackend: 443,
//     frontend: 'http://localhost.com:3000'
// }

// export const config = {
//     protocol: 'http',
//     server : 'localhost',
//     port: 3000,
//     portBackend: 3001,
//     frontend: 'http://localhost.com:3000'
// }

export const config = {
    protocol: window.location.hostname.includes('herokuapp') ? 'https' :'http',
    server : window.location.hostname.includes('herokuapp') ? 'delphusback.herokuapp.com' : window.location.hostname,
    port: 3000,
    portBackend: window.location.hostname.includes('herokuapp') ? 443 : 3001,
    frontend: 'http://localhost.com:3000'
}

export default config;
