export default {
  openapi: '3.0.1',
  servers: [
    {
      url: 'http://127.0.0.1:8080/api'
    }
  ],
  info: {
    title: 'Swagger Torrent Downloader Service',
    description: '',
    contact: {
      email: 'alexanderdemchik672@gmail.com'
    },
    license: {
      name: 'Apache 2.0',
      url: 'http://www.apache.org/licenses/LICENSE-2.0.html'
    },
    version: '1.0.0'
  },
  tags: [
    {
      name: 'torrent',
      description: 'Torrents CRUD'
    }
  ],
  paths: {
    '/torrent': {
      post: {
        tags: ['torrent'],
        summary: 'Add new torrent',
        requestBody: {
          content: {
            'application/octet-stream': {
              schema: {
                type: 'string',
                format: 'binary'
              }
            },
            'text/plain': {
              schema: {
                type: 'string'
              }
            }
          }
        },
        responses: {
          200: {
            description: 'OK',
            content: {}
          },
          400: {
            description: 'Bad request',
            content: {}
          }
        }
      },
      get: {
        tags: ['torrent'],
        summary: 'Get all torrents',
        responses: {
          200: {
            description: 'OK',
            content: {}
          },
          400: {
            description: 'Bad request',
            content: {}
          }
        }
      }
    }
  },
  components: {}
};
