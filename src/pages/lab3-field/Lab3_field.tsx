import React, {ReactElement} from 'react';
import {Button, Grid, Paper, TextField} from "@material-ui/core";
import {Graph} from 'react-d3-graph'

import s from './style.module.scss'

const MAX_DISTANCE = 100;

type TForm = {
    cities: number;
    ants: number;
    alpha: number;
    beta: number;
    r: number;
    Q: number;
}


type TCity = {
    x: number;
    y: number;
}

type TMap = TCity[];

let map: TMap = [];


type TNode = { id: string }
type TLink = { source: string; target: string }
type TGraphData = {
    nodes: TNode[];
    links: TLink[];
}

const data: TGraphData = {
    nodes: [],
    links: [],
};

const Lab3_field = (): ReactElement => {
    const [form, setForm] = React.useState<TForm>({
        cities: 0,
        ants: 0,
        alpha: 0,
        beta: 0,
        r: 0,
        Q: 0,
    });

    const getMap = (size: number) => {
        const newMap: TMap = Array(size).fill(0).map(_ => ({
            x: Math.round(Math.random() * MAX_DISTANCE),
            y: Math.round(Math.random() * MAX_DISTANCE),
        }))

        map = Array.from<TCity>(newMap);

        data.nodes = [];
        for (let i = 0; i < size; i++) {
            data.nodes.push({id: i.toString()});
        }

        data.links = [];
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (data.links.length === 0) {
                    data.links.push({
                        source: data.nodes[0].id,
                        target: data.nodes[1].id,
                    });
                    data.links.push({
                        source: data.nodes[1].id,
                        target: data.nodes[0].id,
                    })
                } else {
                    if (i !== j) {
                        data.links.push({
                            source: data.nodes[i].id,
                            target: data.nodes[j].id,
                        })
                        data.links.push({
                            source: data.nodes[j].id,
                            target: data.nodes[i].id,
                        })
                    }
                }
            }
        }

        console.log(data);
    }

    const changeTextField = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
        const temp: string = event.target.value;

        if (field === 'cities' && +temp >= 3 && form.cities !== +temp)
            getMap(+temp);

        setForm({...form, [field]: temp});
    }

    const handleClick = () => {
        console.log('here');
    }

    return <Grid container spacing={2} className={s.lab3_field}>
        <Grid item xs={12} sm={12} md={12} lg={9} xl={9} className={s.grid_item}>
            <Paper className={s.leftPanel}>
                {data.nodes.length > 0 && <Graph
                    id="graph" // id is mandatory, if no id is defined rd3g will throw an error
                    data={data}
                />}
            </Paper>
        </Grid>
        <Grid item xs={12} sm={12} md={12} lg={3} xl={3} className={s.grid_item}>
            <Paper className={s.rightPanel}>
                <TextField className={s.text_field} id="outlined-basic" label="Количество городов" variant="outlined"
                           value={form.cities}
                           onChange={(event) => changeTextField(event, 'cities')}/>
                <TextField className={s.text_field} id="outlined-basic" label="Количество муравьев" variant="outlined"
                           value={form.ants}
                           onChange={(event) => changeTextField(event, 'ants')}/>
                <TextField className={s.text_field} id="outlined-basic" label="α (относительная значимость пути)"
                           variant="outlined"
                           value={form.alpha}
                           onChange={(event) => changeTextField(event, 'alpha')}/>
                <TextField className={s.text_field} id="outlined-basic" label="β (относительная значимость видимости)"
                           variant="outlined"
                           value={form.beta}
                           onChange={(event) => changeTextField(event, 'beta')}/>
                <TextField className={s.text_field} id="outlined-basic"
                           label="r (коэффициент количества фермента, оставляемого муравьем)" variant="outlined"
                           value={form.r}
                           onChange={(event) => changeTextField(event, 'r')}/>
                <TextField className={s.text_field} id="outlined-basic"
                           label="Q (количество фермента, оставляемого муравьем" variant="outlined"
                           value={form.Q}
                           onChange={(event) => changeTextField(event, 'Q')}/>
                <Button onClick={handleClick} children={"Запуск"} variant="contained" color="primary"
                        className={s.button}/>
            </Paper>
        </Grid>
    </Grid>
}

export default Lab3_field;