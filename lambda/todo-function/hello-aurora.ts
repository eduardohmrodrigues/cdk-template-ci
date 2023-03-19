import createTodo from './repository/createTodo';
import listTodos from './repository/listTodos';
import getTodo from './repository/getTodo';

exports.handler = async function(event: any) {
    console.log("request", JSON.stringify(event, undefined, 2));

    switch (event.requestContext.http.method) {
        case 'POST': {
            console.log('POST')
            const task = JSON.parse(event.body);
            const todo =  await createTodo(task.task);
            return sendRes(200, JSON.stringify(todo))
        }

        case 'GET': {
            console.log('GET')

            if (event.queryStringParameters) {
                console.log('fetch one');
                const id = event.queryStringParameters.id
                console.log(id);
                const todo = await getTodo(id);
                return sendRes(200, JSON.stringify(todo));
            } else {
                console.log('list all')
                const todos = await listTodos();
                return sendRes(200, JSON.stringify(todos))
            }
        }

        default:
            return sendRes(404, `Hello, CDK! You have sent a weird request to: ${event.path}\n`)
    }
}

const sendRes = (status: number, body: string) => {
    var response = {
        statusCode: status,
        headers: {
            "Content-Type": "text/html",
        },
        body: body,
    };

    return response;
};
