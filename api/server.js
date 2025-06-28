const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const port = 3000;

server.use(middlewares);

server.use(jsonServer.rewriter({
    '/api/*': '/$1',
    '/blog/:resource/:id/show': '/:resource/:id'
}));

// Middleware para tratar paginação e customizar resposta
server.use((req, res, next) => {
    res.header('Access-Control-Expose-Headers', 'X-Total-Count');
    const originalSend = res.send;

    res.send = function (body) {
        let data;
        try {
            data = JSON.parse(body);
        } catch {
            return originalSend.call(this, body);
        }

        const isArray = Array.isArray(data);
        const totalCount = res.getHeader('X-Total-Count');

        const response = {
            value: data,
            count: totalCount ? Number(totalCount) : (isArray ? data.length : 1),
            hasSuccess: true,
            hasError: false,
            errors: [],
            httpStatusCode: "OK",
            dataRequisicao: new Date()
        };

        return originalSend.call(this, JSON.stringify(response));
    };

    next();
});


server.use(router);

server.listen(port, () => {
    console.log(`JSON Server is running at http://localhost:${port}`);
});

module.exports = server;
