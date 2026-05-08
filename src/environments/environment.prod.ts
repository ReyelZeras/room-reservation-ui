export const environment = {
  production: true,
  // No Docker, o frontend e backend estão na mesma rede,
  // e o Nginx faz o roteamento ou aponta-se para o domínio público se aplicável
  apiUrl: '/api/v1'
};
