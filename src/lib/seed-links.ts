import type { LinkCategoria } from "./types";

export interface SeedLink {
  label: string;
  url: string;
  categoria: LinkCategoria;
  note: string;
}

export const SEED_LINKS: SeedLink[] = [
  {
    label: "Dashboard Quality",
    url: "https://us-east-1.quicksight.aws.amazon.com/sn/account/nu-qs-prod/dashboards/91e5164e-4659-4f4a-8858-c231aad630b1/sheets/91e5164e-4659-4f4a-8858-c231aad630b1_6dc57a7e-6fae-4de1-851c-13cf2dccaf98?state=QUFBQURtdGxlUzB4TlRZNE9UVTFNekEzYkFiMTNBXzkzaGw4SFg4b1hCeTZXbV9qeV9LMXlxbHY5RU5wTnpjOVRkZWd6SVU1cFVRbS1EeG9wZVJNeGZPQWZPM2gzLXVKdnJKZVM1STdmN3ZhLXJpMFRSX1BFNnVrbV9rQmI0X0F1d3dIM2lCUUIzandMZnJDNVZTdWk0Uy1Ic1VWdHVNekNibFF4dWpyM0s5OU5KOUZzQXI1Q201V09KSnFZNDNYS1kyWFNJQk03alZCemNGcHFkRGNBMjJIOGp6N3l0Q01SOGlHUWQ0RG05RVRaaWF0NFdWeXp2S21ONE5B#",
    categoria: "quality",
    note: "Painel QuickSight",
  },
  {
    label: "Databricks Third Party (Identity Fraud)",
    url: "https://nubank-e2-general.cloud.databricks.com/editor/notebooks/309791001131908?o=2093534396923660#command/7879941847363525",
    categoria: "quality",
    note: "Notebook Identity Fraud",
  },
  {
    label: "Databricks TS por fila - Quality",
    url: "https://nubank-e2-general.cloud.databricks.com/editor/notebooks/64816448780993?o=2093534396923660#command/6017426627250337",
    categoria: "quality",
    note: "Notebook por fila",
  },
  {
    label: "Drive de Quality",
    url: "https://drive.google.com/drive/u/0/folders/1w_9IyBFnaz82WG3Mz88bxhNz8EFa0llE",
    categoria: "quality",
    note: "Pasta no Drive",
  },
  {
    label: "Jira Apontamentos Externos e Contestação",
    url: "https://nubank.atlassian.net/jira/servicedesk/projects/QF/list?jql=project%20%3D%20QF%20ORDER%20BY%20cf%5B10019%5D%20ASC",
    categoria: "quality",
    note: "Fila Jira QF",
  },
  {
    label: "Base Jira",
    url: "https://docs.google.com/spreadsheets/d/1FAP2KxStJx6CmQwOYgHAkfmHz8fklblvBWbA1oJweW8/edit?gid=0#gid=0",
    categoria: "quality",
    note: "Planilha de base",
  },
  {
    label: "Confluence Quality",
    url: "https://nubank.atlassian.net/wiki/spaces/INVOPS/pages/265539911898/Quality+ID+VP",
    categoria: "quality",
    note: "Documentação ID/VP",
  },
  {
    label: "Base Evaluation Platform - V3",
    url: "https://docs.google.com/spreadsheets/d/1JH9zEK111I53FYt5nx39YmzuNa5p19dwz8n-veCyE5E/edit?gid=1803184042#gid=1803184042",
    categoria: "csat",
    note: "Planilha V3",
  },
  {
    label: "Base Intelligence Hub",
    url: "https://docs.google.com/spreadsheets/d/1-mr6J-x1PtJN49nZD5mWSv6gR92chqWIPbyKSvkTqPs/edit?gid=0#gid=0",
    categoria: "csat",
    note: "Planilha",
  },
  {
    label: "Drive CSAT",
    url: "https://drive.google.com/drive/folders/1U5H4Osb-1d8EPakkNCRo3_ddQcsti4-v",
    categoria: "csat",
    note: "Pasta no Drive",
  },
];
