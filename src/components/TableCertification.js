import { useState, useMemo, useCallback } from "react";
import axios from "axios";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Input from "@mui/material/Input";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import PropTypes from "prop-types";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { TextField, List, ListItem, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/material/styles";
import Loading from "./Loading";
import * as XLSX from "xlsx";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

const headCells = [
  {
    id: "cpf",
    numeric: true,
    disablePadding: true,
    label: "CPF",
  },
  {
    id: "name",
    numeric: true,
    disablePadding: true,
    label: "Nome",
  },
  {
    id: "certification",
    numeric: true,
    disablePadding: false,
    label: "Certificação",
  },
  {
    id: "firstCertification",
    numeric: true,
    disablePadding: false,
    label: "1ª Certificação",
  },
  {
    id: "lastUpdate",
    numeric: true,
    disablePadding: false,
    label: "Ultima Atualização",
  },
  {
    id: "maturity",
    numeric: true,
    disablePadding: false,
    label: "Vencimento",
  },
  {
    id: "situation",
    numeric: true,
    disablePadding: false,
    label: "Situação",
  },
];

function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "center"}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

export const TableCertification = () => {
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("name");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [cpf, setCpf] = useState("");
  const [listaCpf, setListaCpf] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const open = Boolean(anchorEl);

  const fetchData = useCallback(async (event) => {
    setLoading(true);
    setCsvFile(event.target.files[0]);

    const formdata = new FormData();
    formdata.append("file", event.target.files[0]);

    try {
      await axios(
        "https://wi37wngbxtenwyhgk6r5tts5mi0vrtcp.lambda-url.us-east-1.on.aws/anbima",
        {
          method: "post",
          mode: "no-cors",
          data: formdata,
          headers: {
            "Content-Type": "multipart/form-data",
            "Access-Control-Allow-Origin": "*",
          },
        }
      ).then((res) => setUser(res.data.data));
    } catch (error) {
      setLoading(false);
      setError(true);
      console.error(error);
      return error;
    }
    setLoading(false);
  }, []);

  const visibleRows = useMemo(
    () =>
      [...user]
        .sort(getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [order, orderBy, page, rowsPerPage, user],
    user
  );

  function convertCSVtoExcel() {
    if (user && csvFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "string", codepage: 65001 });
  
        // Se o CSV tem uma única planilha
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
  
        // Criar um novo arquivo Excel
        const newWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(newWorkbook, worksheet, "Sheet1");
  
        // Exportar o arquivo Excel
        XLSX.writeFile(newWorkbook, "output.xlsx");
      };
  
      reader.readAsText(csvFile);
    } else {

      const dadosAchatados = user.flatMap((dado) => {
        return dado.certifications.map((certification, index) => ({
          cpf: dado.cpf,
          nome: dado.name,
          certificacao: certification.name,
          primeiraCertificacao: certification.first_certification,
          ultimaAtualizacao: certification.last_update,
          vencimento: certification.due_date,
          situacao: certification.status,
        }));
      });
        // Criar nova planilha de trabalho
        const planilha = XLSX.utils.json_to_sheet(dadosAchatados);
        console.log("user tabble", user)
        const livro = XLSX.utils.book_new();

        // Adicionar a planilha ao livro
        XLSX.utils.book_append_sheet(livro, planilha, 'Dados');

        // Gerar arquivo Excel e baixar
        XLSX.writeFile(livro, 'tabela.xlsx');
    }

  }
  // Função para adicionar CPF à lista
  const adicionarCpf = () => {
    if (cpf && !listaCpf.includes(cpf)) {
      setListaCpf([...listaCpf, cpf]);
      setCpf("");
    }
  };

  // Função para remover CPF da lista
  const removerCpf = (cpfRemover) => {
    setListaCpf(listaCpf.filter((c) => c !== cpfRemover));
  };

  // Função para simular busca de CPF (aqui você colocaria sua lógica de busca)
  const buscarCpfs = async (event) => {
    console.log("Buscando CPFs:", listaCpf);
    setLoading(true);

    try {
      if (listaCpf.length === 1) {
        await axios
          .get(
            `https://wi37wngbxtenwyhgk6r5tts5mi0vrtcp.lambda-url.us-east-1.on.aws/anbima/${listaCpf}`,
            {
              mode: "no-cors",
              headers: {
                "Access-Control-Allow-Origin": "*",
              },
            }
          )
          .then((res) => setUser(res.data.data));
      } else {
        await axios
          .get(
            `https://wi37wngbxtenwyhgk6r5tts5mi0vrtcp.lambda-url.us-east-1.on.aws/anbima/multi?cpf=${listaCpf}`,
            {
              mode: "no-cors",
              headers: {
                "Access-Control-Allow-Origin": "*",
              },
            }
          )
          .then((res) => setUser(res.data.data));
      }
    } catch (error) {
      setLoading(false);
      setError(true);
      console.error(error);
      return error;
    }

    setLoading(false);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = user.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  // const handleClick = (event, id) => {
  //     const selectedIndex = selected.indexOf(id);
  //     let newSelected = [];

  //     if (selectedIndex === -1) {
  //       newSelected = newSelected.concat(selected, id);
  //     } else if (selectedIndex === 0) {
  //       newSelected = newSelected.concat(selected.slice(1));
  //     } else if (selectedIndex === selected.length - 1) {
  //       newSelected = newSelected.concat(selected.slice(0, -1));
  //     } else if (selectedIndex > 0) {
  //       newSelected = newSelected.concat(
  //         selected.slice(0, selectedIndex),
  //         selected.slice(selectedIndex + 1),
  //       );
  //     }
  //     setSelected(newSelected);
  // };
  //onClick={(event) => handleClick(event, row.id)}

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <Container sx={{ paddingTop: "24px", width: "95%" }} maxWidth="false">
      <Paper sx={{ mb: 2, padding: "16px" }}>
        {user.length === 0 ? (
          <TableHead
            sx={{
              display: "grid",
              justifyItems: "start",
              margin: "10px 0 20px",
            }}
          >
            <Typography variant="h5" sx={{ margin: "10px 0 20px" }}>
              Buscar certificações
            </Typography>
            <Button
              component="label"
              role={undefined}
              variant="contained"
              tabIndex={-1}
              startIcon={<CloudUploadIcon />}
              sx={{ color: "#000000", bgcolor: "transparent" }}
            >
              Enviar arquivo csv
              <VisuallyHiddenInput
                id="csvFileInput"
                accept=".csv"
                type="file"
                onChange={(e) => fetchData(e)}
                multiple
              />
            </Button>
            {error && (
              <Typography variant="overline" color="error">
                Ops, arquivo inválido. Insira um arquivo CSV!
              </Typography>
            )}

            <Box>
              <TextField
                label="Buscar CPF"
                variant="outlined"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                sx={{ margin: "20px 0" }}
              />
              {listaCpf.length > 0 && (
                <Button
                  variant="contained"
                  onClick={(e) => buscarCpfs(e)}
                  sx={{
                    color: "#000000",
                    bgcolor: "transparent",
                    margin: "25px 10px",
                  }}
                >
                  Buscar CPFs
                </Button>
              )}
            </Box>

            {error && (
              <Typography variant="overline" color="error">
                Ops, CPF inválido!
              </Typography>
            )}
            <Button
              variant="contained"
              onClick={adicionarCpf}
              disabled={!cpf}
              sx={{ color: "#000000", bgcolor: "transparent" }}
            >
              Adicionar CPF
            </Button>

            <List>
              {listaCpf.map((cpfItem, index) => (
                <ListItem key={index}>
                  {cpfItem}
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => removerCpf(cpfItem)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </TableHead>
        ) : (
          <TableHead
            sx={{
              display: "block",
              margin: "10px 0 20px",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="h5" sx={{ margin: "10px 0 20px" }}>
                Resultados encontrados
              </Typography>
              <Button
                variant="contained"
                aria-controls={open ? "basic-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                onClick={handleClick}
                startIcon={<FileDownloadIcon />}
                sx={{ color: "#000000", bgcolor: "transparent" }}
              >
                EXPORTAR
              </Button>
              <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                  "aria-labelledby": "basic-button",
                }}
              >
                <MenuItem onClick={convertCSVtoExcel}>
                  Exportar para Excel
                </MenuItem>
              </Menu>
            </Box>
            <Box sx={{ display: "grid", justifyItems: "start" }}>
              <Button
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                startIcon={<CloudUploadIcon />}
                sx={{ color: "#000000", bgcolor: "transparent" }}
              >
                Enviar arquivo csv
                <VisuallyHiddenInput
                  id="csvFileInput"
                  accept=".csv"
                  type="file"
                  onChange={(e) => fetchData(e)}
                  multiple
                />
              </Button>
              <Box>
                <TextField
                  label="Buscar CPF"
                  variant="outlined"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  margin="normal"
                />
                {listaCpf.length > 0 && (
                  <Button
                    variant="contained"
                    onClick={(e) => buscarCpfs(e)}
                    sx={{
                      color: "#000000",
                      bgcolor: "transparent",
                      margin: "25px 10px",
                    }}
                  >
                    Buscar CPFs
                  </Button>
                )}
              </Box>
              <Button
                variant="contained"
                onClick={adicionarCpf}
                disabled={!cpf}
                sx={{ color: "#000000", bgcolor: "transparent" }}
              >
                Adicionar CPF
              </Button>

              <List>
                {listaCpf.map((cpfItem, index) => (
                  <ListItem key={index}>
                    {cpfItem}
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => removerCpf(cpfItem)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          </TableHead>
        )}
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={user.length}
              key={user.id}
            />
            <TableBody>
              {visibleRows.map((row, index) => {
                const isItemSelected = selected.includes(row.cpf);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <>
                    {row.certifications.length === 0 ? (
                      <TableRow
                        hover
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={row.id}
                        selected={isItemSelected}
                        sx={{ cursor: "pointer" }}
                      >
                        <TableCell
                          component="th"
                          id={labelId}
                          scope="row"
                          padding="none"
                          align="center"
                        >
                          {row.cpf}
                        </TableCell>
                        <TableCell
                          component="th"
                          id={labelId}
                          scope="row"
                          padding="none"
                          align="right"
                        >
                          {row.name}
                        </TableCell>

                        <TableCell align="right">{row.note}</TableCell>
                        <TableCell align="center">-</TableCell>
                        <TableCell align="center">-</TableCell>
                        <TableCell align="center">-</TableCell>
                        <TableCell align="center">-</TableCell>
                      </TableRow>
                    ) : (
                      row.certifications.map((node) => {
                        return (
                          <TableRow
                            hover
                            role="checkbox"
                            aria-checked={isItemSelected}
                            tabIndex={-1}
                            key={row.id}
                            selected={isItemSelected}
                            sx={{ cursor: "pointer" }}
                          >
                            <TableCell
                              component="th"
                              id={labelId}
                              scope="row"
                              padding="none"
                              align="right"
                            >
                              {row.cpf}
                            </TableCell>
                            <TableCell
                              component="th"
                              id={labelId}
                              scope="row"
                              padding="none"
                              align="right"
                            >
                              {row.name}
                            </TableCell>
                            <TableCell align="right">
                              {node.name === "CPA-10" ? (
                                <Chip
                                  label={node.name}
                                  sx={{
                                    color: "#0b5394",
                                    bgcolor: "#cfe2f3",
                                    fontWeight: "bold",
                                    width: "80px",
                                  }}
                                />
                              ) : node.name === "CPA-20" ? (
                                <Chip
                                  label={node.name}
                                  sx={{
                                    color: "#38761d",
                                    bgcolor: "#d9ead3",
                                    fontWeight: "bold",
                                    width: "80px",
                                  }}
                                />
                              ) : (
                                <Chip
                                  label={node.name}
                                  sx={{
                                    color: "#FFC300",
                                    bgcolor: "#fff2cc",
                                    fontWeight: "bold",
                                    width: "80px",
                                  }}
                                />
                              )}
                            </TableCell>
                            <TableCell align="right">
                              {node.first_certification}
                            </TableCell>
                            <TableCell align="right">
                              {node.last_update}
                            </TableCell>
                            <TableCell align="right">{node.due_date}</TableCell>
                            <TableCell align="right">
                              {node.status === "Ativa" ? (
                                <Chip
                                  label={node.status}
                                  sx={{
                                    color: "#38761d",
                                    bgcolor: "#d9ead3",
                                    fontWeight: "bold",
                                  }}
                                />
                              ) : (
                                <Chip
                                  label="Inativa"
                                  sx={{
                                    color: "#c30101",
                                    bgcolor: "#f4cccc",
                                    fontWeight: "bold",
                                  }}
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={user.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Mostrar por página"
        />
      </Paper>
    </Container>
  );
};
