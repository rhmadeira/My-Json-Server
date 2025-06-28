server.use((req, res, next) => {
    res.header('Access-Control-Expose-Headers', 'X-Total-Count');

    const originalSend = res.send;
    res.send = function (body) {
        // Só intercepta se a resposta for JSON
        if (res.getHeader('Content-Type')?.includes('application/json')) {
            try {
                const data = JSON.parse(body);
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
            } catch {
                // deixa passar direto se não for JSON válido
            }
        }

        return originalSend.call(this, body);
    };

    next();
});
