import { defineConfig } from 'orval'

export default defineConfig({
  ecommerce: {
    input: {
      target: 'https://localhost:5001/swagger/v1/swagger.json',
      validation: false,
    },
    output: {
      mode: 'tags-split',
      target: './app/api/generated/endpoints',
      schemas: './app/api/generated/models',
      client: 'vue-query',
      baseUrl: '',
      override: {
        mutator: {
          path: './app/api/axios-instance.ts',
          name: 'customInstance',
        },
        query: {
          useQuery: true,
          useMutation: true,
          signal: true,
        },
      },
    },
  },
})
