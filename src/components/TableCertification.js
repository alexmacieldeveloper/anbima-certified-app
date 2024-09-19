import { useState, useMemo } from 'react'
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Paper from '@mui/material/Paper';
import { visuallyHidden } from '@mui/utils';

function createData(id, name, certification, firstCertification, lastUpdate, maturity, situation) {
    return {
      id,
      name,
      certification,
      firstCertification,
      lastUpdate,
      maturity,
      situation,
    };
}

const rows = [
    createData(98674653600, 'Cláudio Emilio Cotta Joaquim', 'CPA10', '11/11/1111', '29/12/2023', '01/01/2025', 'active'),
    createData(11111111111, 'Joao Luiz Cotta Joaquim', 'CPA10', '11/11/1111', '29/12/2023', '01/01/2025', 'active'),
    createData(22222222222, 'Roberto Cotta Joaquim', 'CPA10', '11/11/1111', '29/12/2023', '01/01/2025', 'active'),
    createData(33333333333, 'Bruno Cotta Joaquim', 'CPA10', '11/11/1111', '29/12/2023', '01/01/2025', 'active'),
    createData(44444444444, 'Marcos Aurelio Cotta Joaquim', 'CPA10', '11/11/1111', '29/12/2023', '01/01/2025', 'active'),
    createData(55555555555, 'Peietro Cotta Joaquim', 'CPA10', '11/11/1111', '29/12/2023', '01/01/2025', 'active'),
    createData(66666666666, 'Luiz  Cotta Joaquim', 'CPA10', '11/11/1111', '29/12/2023', '01/01/2025', 'active'),
    createData(77777777777, 'Mauricio Roger Joaquim', 'CPA10', '11/11/1111', '29/12/2023', '01/01/2025', 'inactive'),
    createData(46656356564, 'Abel Ferreira', 'CPA10', '11/11/1111', '29/12/2023', '01/01/2025', 'active'),
    createData(86865685684, 'Eduardo Pereira Joaquim', 'CPA10', '11/11/1111', '29/12/2023', '01/01/2025', 'active'),
    createData(32343243544, 'Edmundo Joaquim', 'CPA10', '11/11/1111', '29/12/2023', '01/01/2025', 'active'),
    createData(76888880453, 'Francisco Jorge', 'CPA10', '11/11/1111', '29/12/2023', '01/01/2025', 'inactive'),
    createData(14135352644, 'Gustavo Gomez', 'CPA10', '11/11/1111', '29/12/2023', '01/01/2025', 'active'),
  ];

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
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
}

const headCells = [
    {
      id: 'cpf',
      numeric: true,
      disablePadding: false,
      label: 'CPF',
    },
    {
      id: 'name',
      numeric: true,
      disablePadding: true,
      label: 'Nome',
    },
    {
      id: 'certification',
      numeric: true,
      disablePadding: false,
      label: 'Certificação',
    },
    {
      id: 'firstCertification',
      numeric: true,
      disablePadding: false,
      label: '1ª Certificação',
    },
    {
      id: 'lastUpdate',
      numeric: true,
      disablePadding: false,
      label: 'Ultima Atualização',
    },
    {
        id: 'maturity',
        numeric: true,
        disablePadding: false,
        label: 'Vencimento',
    },
    {
        id: 'situation',
        numeric: true,
        disablePadding: false,
        label: 'Situação',
    },
];

function EnhancedTableHead(props) {
    const { order, orderBy, onRequestSort } =
      props;
    const createSortHandler = (property) => (event) => {
      onRequestSort(event, property);
    };
  
    return (
      <TableHead>
        <TableRow>
          {headCells.map((headCell) => (
            <TableCell
              key={headCell.id}
              align={headCell.numeric ? 'right' : 'left'}
              padding={headCell.disablePadding ? 'none' : 'normal'}
              sortDirection={orderBy === headCell.id ? order : false}
            >
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
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
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
};



export const TableCertification = () => {
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('name');
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };
    
    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
          const newSelected = rows.map((n) => n.id);
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

    const visibleRows = useMemo(
        () =>
        [...rows]
            .sort(getComparator(order, orderBy))
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
        [order, orderBy, page, rowsPerPage],
    );

    return (
        <Container sx={{ paddingTop: '24px'}}>
            <Paper sx={{ width: '100%', mb: 2, padding: '16px'}}>
                <Typography variant="h5">Resultados encontrados</Typography>
                <TableContainer>
                    <Table
                        sx={{ minWidth: 750 }}
                        aria-labelledby="tableTitle"
                    >
                        <EnhancedTableHead
                            numSelected={selected.length}
                            order={order}
                            orderBy={orderBy}
                            onSelectAllClick={handleSelectAllClick}
                            onRequestSort={handleRequestSort}
                            rowCount={rows.length}
                        />
                        <TableBody>
                        {visibleRows.map((row, index) => {
                            const isItemSelected = selected.includes(row.id);
                            const labelId = `enhanced-table-checkbox-${index}`;

                            return (
                            <TableRow
                                hover
                                role="checkbox"
                                aria-checked={isItemSelected}
                                tabIndex={-1}
                                key={row.id}
                                selected={isItemSelected}
                                sx={{ cursor: 'pointer' }}
                            >
                                <TableCell
                                    component="th"
                                    id={labelId}
                                    scope="row"
                                    padding="none"
                                    align="right"
                                >
                                    {row.id}
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
                                <TableCell align="right">{row.certification}</TableCell>
                                <TableCell align="right">{row.firstCertification}</TableCell>
                                <TableCell align="right">{row.lastUpdate}</TableCell>
                                <TableCell align="right">{row.maturity}</TableCell>
                                <TableCell align="right">{row.situation}</TableCell>
                            </TableRow>
                            );
                        })}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Mostrar por página"
                />
            </Paper>
        </Container>
    )
}