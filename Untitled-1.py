# %%
# PASSO 1: Setup de ambiente e importação de bibliotecas

# Requisitos:
# - Python 3.8+
# - dash==2.11.0+ (ou 3.x, compatível)
# - plotly>=5.7
# - dash-bootstrap-components>=1.4
# - pandas, numpy

# Instale os pacotes se necessário (comente esta célula após instalar uma vez)
# !pip install dash plotly dash-bootstrap-components pandas numpy

import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from dash import Dash, dcc, html, Input, Output, State, callback_context
import dash_bootstrap_components as dbc
from dash.exceptions import PreventUpdate

import warnings
warnings.filterwarnings('ignore')

print("✅ Bibliotecas importadas com sucesso!")

# %%


# Gerar dados sintéticos para o dashboard
import pandas as pd
import numpy as np

categories = ['Customer', 'Spill', 'Injury', 'Transport', 'Equipment', 'Security', 'Divergence', 'Complaint']
df.to_csv('../data/incidents.csv', index=False)
# Parâmetros principais
categories = ['Customer', 'Spill', 'Injury', 'Transport', 'Equipment', 'Security', 'Divergence', 'Complaint']
causes = ['Material', 'Procedure', 'Design', 'Training', 'Management', 'External', 'Equipment', 'Personnel']
sites = ['Weston', 'Bolton', 'Shirley', 'Lincoln', 'Maynard', 'Acton', 'Concord', 'Hudson']
months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
years = [2007, 2008, 2009]
severities = ['Critical', 'Major', 'Medium', 'Near Miss']
status = ['Open', 'Closed']

np.random.seed(42)
records = []
for year in years:
    for month in months:
        for site in sites:
            for category in categories:
                for cause in np.random.choice(causes, size=2, replace=False):
                    severity = np.random.choice(severities)
                    stat = np.random.choice(status, p=[0.3, 0.7])
                    count = np.random.poisson(lam=8)
                    if count == 0:
                        continue
                    records.append({
                        'Category': category,
                        'Cause': cause,
                        'Site': site,
                        'Month': month,
                        'Year': year,
                        'Severity': severity,
                        'Status': stat,
                        'Count': count
                    })

df = pd.DataFrame(records)
print(f"✅ Dados gerados! Total de registros: {len(df)}")
display(df.head())

# %%


# PASSO 3: Design do layout do dashboard
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
# ... código de criação do dashboard e exportação HTML
# Paleta profissional (PatternFly/Plotly)
COLORS = {
    'primary': '#1f77b4',   # Azul
    'success': '#2ca02c',   # Verde
    'warning': '#ff7f0e',   # Laranja
    'danger': '#d62728',    # Vermelho
    'info': '#17becf',      # Ciano
    'secondary': '#7f7f7f', # Cinza
    'background': '#f8f9fa',
    'card_bg': '#fff',
    'text_primary': '#212529',
    'text_secondary': '#6c757d'
}

# Inicie o app Dash
app = Dash(__name__, external_stylesheets=[dbc.themes.BOOTSTRAP])

app.layout = dbc.Container(fluid=True, style={'backgroundColor': COLORS['background'], 'padding': '12px'}, children=[
    dbc.Row([
        dbc.Col([
            dbc.Row([
                dbc.Col([
                    html.Div([
                        html.H4("Category", className="text-center", style={'fontWeight': 'bold'}),
                        dcc.Graph(id='bar-category')
                    ])
                ], width=4),
                dbc.Col([
                    html.Div([
                        html.H4("Cause", className="text-center", style={'fontWeight': 'bold'}),
                        dcc.Graph(id='bar-cause')
                    ])
                ], width=4),
                dbc.Col([
                    html.Div([
                        html.H4("Month", className="text-center", style={'fontWeight': 'bold'}),
                        dcc.Graph(id='line-month')
                    ])
                ], width=4),
            ])
        ], width=10),
        dbc.Col([
            html.Div([
                html.H5("Filtros", style={'fontWeight': 'bold', 'marginBottom': '8px'}),
                html.Label("Category"), dcc.Dropdown(id="filter-category", multi=True),
                html.Label("Site"), dcc.Dropdown(id="filter-site", multi=True),
                html.Label("Month"), dcc.Dropdown(id="filter-month", multi=True),
                html.Label("Cause"), dcc.Dropdown(id="filter-cause", multi=True),
                html.Label("Severity"), dcc.Dropdown(id="filter-severity", multi=True),
                html.Label("Year"), dcc.Dropdown(id="filter-year", multi=True),
                html.Label("Status"), dcc.Dropdown(id="filter-status", multi=True),
                html.Hr(),
                html.Div("Total de registros filtrados:", style={'marginTop':'12px'}),
                html.H5(id="filtered-count", style={'color': COLORS['primary'], 'fontWeight': 'bold'})
            ], style={'background': COLORS['card_bg'], 'padding': '16px', 'borderRadius': '8px', 'boxShadow': '0 2px 8px #e3e3e3'})
        ], width=2)
    ]),

    dbc.Row([
        dbc.Col([
            dbc.Row([
                dbc.Col([
                    html.Div([
                        html.H4("Site", className="text-center", style={'fontWeight': 'bold'}),
                        dcc.Graph(id='bar-site')
                    ])
                ], width=4),
                dbc.Col([
                    html.Div([
                        html.H4("Trend", className="text-center", style={'fontWeight': 'bold'}),
                        dcc.Graph(id='bar-trend')
                    ])
                ], width=4),
                dbc.Col([
                    html.Div([
                        html.H4("Severity", className="text-center", style={'fontWeight': 'bold'}),
                        dcc.Graph(id='pie-severity')
                    ])
                ], width=4),
            ])
        ], width=10),
        dbc.Col([], width=2)  # Sidebar ocupa somente a linha de cima
    ])
])

print("✅ Layout estruturado. Pronto para conectar os dados e gráficos!")

# %%
# PASSO 4: Implementação dos gráficos e preenchimento automático dos filtros

from dash.dependencies import ALL

# Preencher opções dos filtros com base nos dados
def get_dropdown_options(col):
    opts = [{'label': str(i), 'value': i} for i in sorted(df[col].unique())]
    return opts

@app.callback(
    [Output("filter-category", "options"),
     Output("filter-site", "options"),
     Output("filter-month", "options"),
     Output("filter-cause", "options"),
     Output("filter-severity", "options"),
     Output("filter-year", "options"),
     Output("filter-status", "options")],
    Input("filter-category", "options")  # Fake input apenas para trigger inicial
)
def fill_filter_options(_):
    return (
        get_dropdown_options("Category"),
        get_dropdown_options("Site"),
        get_dropdown_options("Month"),
        get_dropdown_options("Cause"),
        get_dropdown_options("Severity"),
        get_dropdown_options("Year"),
        get_dropdown_options("Status"),
    )

# Callback para filtrar o DataFrame conforme os filtros
@app.callback(
    [Output('bar-category', 'figure'),
     Output('bar-cause', 'figure'),
     Output('line-month', 'figure'),
     Output('bar-site', 'figure'),
     Output('bar-trend', 'figure'),
     Output('pie-severity', 'figure'),
     Output('filtered-count', 'children')],
    [Input('filter-category', 'value'),
     Input('filter-site', 'value'),
     Input('filter-month', 'value'),
     Input('filter-cause', 'value'),
     Input('filter-severity', 'value'),
     Input('filter-year', 'value'),
     Input('filter-status', 'value')]
)
def update_all_graphs(cat, site, month, cause, severity, year, stat):
    dff = df.copy()
    if cat:      dff = dff[dff['Category'].isin(cat)]
    if site:     dff = dff[dff['Site'].isin(site)]
    if month:    dff = dff[dff['Month'].isin(month)]
    if cause:    dff = dff[dff['Cause'].isin(cause)]
    if severity: dff = dff[dff['Severity'].isin(severity)]
    if year:     dff = dff[dff['Year'].isin(year)]
    if stat:     dff = dff[dff['Status'].isin(stat)]
    total_count = int(dff['Count'].sum())

    def stacked_bar(data, x, color, title, orientation='v'):
        if orientation == 'v':
            fig = px.bar(data, x=x, y='Count', color=color, barmode='stack',
                         color_discrete_sequence=px.colors.qualitative.Plotly)
        else:
            fig = px.bar(data, y=x, x='Count', color=color, barmode='stack',
                         orientation='h', color_discrete_sequence=px.colors.qualitative.Plotly)
        fig.update_layout(title='', legend_title='', margin=dict(t=18, b=6, l=2, r=2))
        return fig

    # Gráfico 1: Category
    fig_cat = stacked_bar(dff, x='Category', color='Severity', title='Category')
    # Gráfico 2: Cause
    fig_cause = stacked_bar(dff, x='Cause', color='Severity', title='Cause')
    # Gráfico 3: Linha temporal (Month)
    dff_line = dff.groupby(['Year', 'Month', 'Category'], as_index=False)['Count'].sum()
    dff_line['MonthNum'] = dff_line['Month'].apply(lambda m: months.index(m))
    dff_line = dff_line.sort_values(['Year', 'MonthNum'])
    fig_line = go.Figure()
    for cat_name in dff_line['Category'].unique():
        sub = dff_line[dff_line['Category'] == cat_name]
        x = sub['Year'].astype(str) + '-' + sub['Month']
        fig_line.add_trace(go.Scatter(x=x, y=sub['Count'], mode='lines+markers', name=cat_name))
    fig_line.update_layout(title='', xaxis_title='', yaxis_title='Count', legend_title='', margin=dict(t=18, b=6, l=2, r=2))

    # Gráfico 4: Barra empilhada horizontal (Site)
    fig_site = stacked_bar(dff, x='Site', color='Severity', title='Site', orientation='h')
    # Gráfico 5: Barra empilhada horizontal (Trend por mês)
    fig_trend = stacked_bar(dff, x='Month', color='Severity', title='Trend', orientation='h')
    # Gráfico 6: Pizza (Severity)
    dff_pie = dff.groupby('Severity', as_index=False)['Count'].sum()
    fig_pie = px.pie(dff_pie, names='Severity', values='Count', color='Severity',
                     color_discrete_sequence=px.colors.qualitative.Plotly)
    fig_pie.update_layout(title='', legend_title='', margin=dict(t=18, b=6, l=2, r=2))

    return fig_cat, fig_cause, fig_line, fig_site, fig_trend, fig_pie, f"{total_count:,}"

print("✅ Gráficos e filtros prontos, aguardando execução do app.")

# %%
# PASSO 5: Execução do app Dash

if __name__ == "__main__":
    # Para execução local, use este comando.
    # Em notebook Jupyter, use app.run(mode="inline") ou apenas app.run()
    app.run(debug=True, port=8050)

# %%
# PASSO 6: Exportar Dashboard para HTML

import plotly.graph_objects as go
from plotly.subplots import make_subplots
import plotly.offline as pyo
from datetime import datetime
import os

# Criar dashboard simplificado
def create_simple_dashboard():
    # Dados
    dff = df.copy()
    
    # Criar figura com 2x3 subplots
    fig = make_subplots(
        rows=2, cols=3,
        subplot_titles=(
            'Incidentes por Categoria', 'Incidentes por Causa', 'Tendencia Mensal',
            'Incidentes por Local', 'Distribuicao Mensal', 'Severidade'
        ),
        specs=[
            [{"type": "bar"}, {"type": "bar"}, {"type": "scatter"}],
            [{"type": "bar"}, {"type": "bar"}, {"type": "pie"}]
        ],
        vertical_spacing=0.15
    )
    
    # 1. Categoria
    cat_data = dff.groupby('Category')['Count'].sum().reset_index().sort_values('Count', ascending=False)
    fig.add_trace(go.Bar(x=cat_data['Category'], y=cat_data['Count'], name='Cat', showlegend=False), row=1, col=1)
    
    # 2. Causa
    cause_data = dff.groupby('Cause')['Count'].sum().reset_index().sort_values('Count', ascending=False)
    fig.add_trace(go.Bar(x=cause_data['Cause'], y=cause_data['Count'], name='Causa', showlegend=False), row=1, col=2)
    
    # 3. Linha temporal
    line_data = dff.groupby(['Year', 'Month'])['Count'].sum().reset_index()
    line_data['MonthNum'] = line_data['Month'].apply(lambda m: months.index(m))
    line_data = line_data.sort_values(['Year', 'MonthNum'])
    line_data['Date'] = line_data['Year'].astype(str) + '-' + line_data['Month']
    fig.add_trace(go.Scatter(x=line_data['Date'], y=line_data['Count'], mode='lines+markers', name='Tend', showlegend=False), row=1, col=3)
    
    # 4. Local
    site_data = dff.groupby('Site')['Count'].sum().reset_index().sort_values('Count', ascending=True)
    fig.add_trace(go.Bar(y=site_data['Site'], x=site_data['Count'], orientation='h', name='Site', showlegend=False), row=2, col=1)
    
    # 5. Mes
    month_data = dff.groupby('Month')['Count'].sum().reset_index()
    month_order = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    month_data['MonthOrder'] = month_data['Month'].apply(lambda x: month_order.index(x))
    month_data = month_data.sort_values('MonthOrder')
    fig.add_trace(go.Bar(x=month_data['Month'], y=month_data['Count'], name='Mes', showlegend=False), row=2, col=2)
    
    # 6. Pizza
    sev_data = dff.groupby('Severity')['Count'].sum().reset_index()
    fig.add_trace(go.Pie(labels=sev_data['Severity'], values=sev_data['Count'], name='Sev', showlegend=False), row=2, col=3)
    
    fig.update_layout(
        title='Dashboard de Analise de Incidentes',
        height=800,
        font=dict(size=12)
    )
    
    return fig

# Gerar dashboard
print("Criando dashboard HTML...")
dashboard_fig = create_simple_dashboard()

# Estatisticas
total_records = len(df)
total_incidents = df['Count'].sum()
period = f"{df['Year'].min()} - {df['Year'].max()}"
sites_count = df['Site'].nunique()

# Nome do arquivo
timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
filename = f"dashboard_{timestamp}.html"

# HTML simples
html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <title>Dashboard de Incidentes</title>
    <meta charset="utf-8">
    <style>
        body {{ font-family: Arial; margin: 20px; background: #f5f5f5; }}
        .header {{ text-align: center; background: #2c3e50; color: white; padding: 20px; margin-bottom: 20px; }}
        .stats {{ display: flex; justify-content: space-around; margin: 20px 0; }}
        .stat {{ background: white; padding: 15px; border-radius: 5px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }}
        .number {{ font-size: 24px; font-weight: bold; color: #2c3e50; }}
        .label {{ color: #7f8c8d; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>Dashboard de Analise de Incidentes</h1>
        <p>Relatorio gerado em {datetime.now().strftime('%d/%m/%Y as %H:%M:%S')}</p>
    </div>
    
    <div class="stats">
        <div class="stat">
            <div class="number">{total_records:,}</div>
            <div class="label">Total de Registros</div>
        </div>
        <div class="stat">
            <div class="number">{total_incidents:,}</div>
            <div class="label">Total de Incidentes</div>
        </div>
        <div class="stat">
            <div class="number">{sites_count}</div>
            <div class="label">Locais</div>
        </div>
        <div class="stat">
            <div class="number">{period}</div>
            <div class="label">Periodo</div>
        </div>
    </div>
    
    {pyo.plot(dashboard_fig, output_type='div', include_plotlyjs=True)}
    
    <div style="text-align: center; margin-top: 20px; color: #666;">
        <p>Dashboard gerado automaticamente</p>
    </div>
</body>
</html>
"""

# Salvar arquivo
try:
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    if os.path.exists(filename):
        file_size = os.path.getsize(filename) / 1024
        print(f"SUCESSO! Dashboard exportado:")
        print(f"Arquivo: {filename}")
        print(f"Tamanho: {file_size:.1f} KB")
        print(f"Local: {os.getcwd()}")
        
        # Tentar abrir
        try:
            os.startfile(filename)
            print("Arquivo aberto no navegador!")
        except:
            print("Abra manualmente o arquivo HTML")
    else:
        print("Erro: arquivo nao foi criado")
        
except Exception as e:
    print(f"Erro: {e}")

print("Dashboard HTML criado com sucesso!")


