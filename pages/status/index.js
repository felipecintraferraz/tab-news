import useSWR from "swr";

const pageEndpoint = "/api/v1/status";

async function fetchAPI(key) {
  const response = await fetch(key);
  const respBody = await response.json();
  return respBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt locale="pt-BR" />
      <DatabaseInfo />
    </>
  );
}

function UpdatedAt(locale) {
  const { isLoading, data } = useSWR(pageEndpoint, fetchAPI);
  let formatedDate = "...";
  if (isLoading == false) {
    const date = new Date(data.updated_at);
    formatedDate = `${date.toLocaleDateString(locale)} - ${date.toLocaleTimeString(locale)} `;
  }
  return (
    <div>
      <b>Última atualização: </b>
      {formatedDate}
    </div>
  );
}

function DatabaseInfo() {
  const { isLoading, data } = useSWR(pageEndpoint, fetchAPI);
  if (isLoading === false)
    return (
      <>
        <div>
          <h3>Banco de dados:</h3>
          <span>
            <b>Versão: </b>
            {data.dependencies.database.version}
          </span>
          <br />
          <span>
            <b>Conexões suportadas: </b>
            {data.dependencies.database.max_connections}
          </span>
          <br />
          <span>
            <b>Conexões abertas: </b>
            {data.dependencies.database.opened_connections}
          </span>
          <br />
        </div>
      </>
    );
}
