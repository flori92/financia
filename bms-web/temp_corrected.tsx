  const isSynced = !alerts.some((alert: DashboardAlert) => alert.level === "danger");
  const lastClosure = data?.lastClosure?.endDate ? formatDate(data.lastClosure.endDate) : "—";
  const lastClosureStatus = data?.lastClosure?.status ?? "";
  const currentYear = new Date().getFullYear();
  const chartMax = chartData.reduce((max, item) => Math.max(max, item.revenue, item.expenses, Math.abs(item.balance)), 0);

  return (
    <div className="space-y-8">
      <section className="bg-gradient-to-r from-[#0F3D3A] to-[#0D9488] rounded-xl p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-4">
              <h1 className="text-3xl font-semibold tracking-tight">Tableau de bord ERP</h1>
              <button onClick={reload} className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium">
                Actualiser
              </button>
            </div>
            <p className="text-white/80 text-lg mt-2 mb-6">
              Vue consolidée de votre activité comptable, trésorerie et fiscale
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
                <Calendar className="w-4 h-4" strokeWidth={1.5} />
                <span className="text-sm font-medium">Exercice {currentYear}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
                <Building className="w-4 h-4" strokeWidth={1.5} />
                <span className="text-sm font-medium">Toutes les entités</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isSynced ? "bg-green-500/20" : "bg-amber-500/20"}`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${isSynced ? "bg-green-400" : "bg-amber-400"}`} />
                <span className="text-sm font-medium">
                  {isSynced ? "Données synchronisées" : "Vérifications recommandées"}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-white/60 mb-1">Dernière clôture</div>
            <div className="text-2xl font-semibold">{lastClosure}</div>
            <div className="text-xs text-white/60 mt-1">{lastClosureStatus}</div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: <Wallet className="text-[#0D9488] w-[22px] h-[22px]" strokeWidth={1.5} />,
            variation: formatPercent(treasuryVar),
            variationTone: treasuryVar >= 0 ? "text-green-600 bg-green-50" : "text-rose-600 bg-rose-50",
            title: "Trésorerie nette",
            value: formatCurrency(treasuryBalance),
            footer: data?.treasuryAlerts?.metrics?.runwayDays
              ? `${Math.round(data.treasuryAlerts.metrics.runwayDays)} jours de couverture`
              : "Runway à surveiller"
          },
          {
            icon: <TrendingUp className="text-blue-600 w-[22px] h-[22px]" strokeWidth={1.5} />,
            variation: formatPercent(revenueVar),
            variationTone: revenueVar >= 0 ? "text-green-600 bg-green-50" : "text-rose-600 bg-rose-50",
            title: `CA ${currentYear} (YTD)`,
            value: formatCurrency(ytdRevenue),
            footer: "Objectif en cours"
          },
          {
            icon: <Activity className="text-green-600 w-[22px] h-[22px]" strokeWidth={1.5} />,
            variation: formatPercent(netIncomeVar),
            variationTone: netIncomeVar >= 0 ? "text-green-600 bg-green-50" : "text-rose-600 bg-rose-50",
            title: "Résultat net (mois)",
            value: formatCurrency(netIncome),
            footer: `Marge: ${(metrics?.kpiMonth.margin ?? 0).toFixed(1)}%`
          },
          {
            icon: <Percent className="text-orange-600 w-[22px] h-[22px]" strokeWidth={1.5} />,
            variation: "À payer",
            variationTone: "text-orange-600 bg-orange-50",
            title: "TVA due (CA3)",
            value: formatCurrency(vatNet),
            footer: `Échéance: ${formatDate(nextVatDue.toISOString())}`
          }
        ].map((kpi, idx: number) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                {kpi.icon}
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded ${kpi.variationTone}`}>{kpi.variation}</span>
            </div>
            <div className="text-sm text-gray-500 mb-1 font-medium">{kpi.title}</div>
            <div className="text-3xl font-semibold tracking-tight mb-2">{kpi.value}</div>
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <Clock className="w-3 h-3" strokeWidth={1.5} />
              <span>{kpi.footer}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "BFR", value: formatCurrency(bfr), hint: "Variation vs N-1 indisponible", tone: "text-gray-500" },
          { label: "DSO", value: dso ? `${Math.round(dso)} jours` : "—", hint: "Optimiser le recouvrement", tone: "text-green-600" },
          { label: "DPO", value: dpo ? `${Math.round(dpo)} jours` : "—", hint: "Suivi fournisseurs", tone: "text-gray-500" },
          { label: "ROE", value: roe ? `${roe.toFixed(1)}%` : "—", hint: "Performance des capitaux", tone: "text-green-600" },
          { label: "Ratio liquidité", value: liquidity.toFixed(2), hint: liquidity >= 1.5 ? "Excellent" : liquidity >= 1 ? "Acceptable" : "Faible", tone: liquidity >= 1.5 ? "text-green-600" : "text-amber-600" },
          { label: "Taux endettement", value: debtRatio ? `${debtRatio.toFixed(1)}%` : "—", hint: "Structure financière", tone: "text-gray-500" }
        ].map((metric, idx: number) => (
          <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-xs text-gray-500 mb-1 font-medium">{metric.label}</div>
            <div className="text-xl font-semibold mb-1">{metric.value}</div>
            <div className={`text-xs ${metric.tone}`}>{metric.hint}</div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Évolution trésorerie & CA</h2>
              <p className="text-sm text-gray-500 mt-1">Analyse croisée sur 12 mois avec prévisionnel</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-lg bg-[#0D9488] text-white">12 mois</span>
              <span className="px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition">Année</span>
              <span className="px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition">Multi-années</span>
            </div>
          </div>

          <div className="flex items-center gap-6 mb-4 text-sm text-gray-600">
            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#0D9488]" />Trésorerie</span>
            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-blue-500" />CA</span>
            <span className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-orange-500" />Charges</span>
          </div>

          <div className="h-72 flex items-end justify-between gap-2">
            {chartData.map((item: ChartDatum, idx: number) => {
              const max = chartMax || 1;
              const revenueHeight = (item.revenue / max) * 140;
              const expenseHeight = (item.expenses / max) * 140;
              const balanceHeight = (Math.abs(item.balance) / max) * 140;
              const balanceClass = item.balance >= 0 ? "bg-[#0D9488]" : "bg-rose-500";
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col gap-1">
                    <div className="w-full bg-blue-500 rounded-t" style={{ height: `${revenueHeight}px` }} title={`CA: ${formatCurrency(item.revenue)}`} />
                    <div className="w-full bg-orange-500 rounded" style={{ height: `${expenseHeight}px` }} title={`Charges: ${formatCurrency(item.expenses)}`} />
                    <div className={`w-full rounded-b ${balanceClass}`} style={{ height: `${balanceHeight}px` }} title={`Trésorerie: ${formatCurrency(item.balance)}`} />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Alertes</h3>
              <span className={`text-xs font-medium px-2 py-1 rounded ${alerts.some((a: DashboardAlert) => a.level === "danger") ? "text-red-600 bg-red-50" : "text-blue-600 bg-blue-50"}`}>
                {alerts.filter((a: DashboardAlert) => a.level === "danger").length} urgent
              </span>
            </div>
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert: DashboardAlert, idx: number) => (
                <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg border ${alert.level === "danger" ? "bg-red-50 border-red-100" : alert.level === "warning" ? "bg-orange-50 border-orange-100" : "bg-blue-50 border-blue-100"}`}>
                  <div className="flex-shrink-0 mt-0.5">
                    {alert.level === "danger" ? <AlertCircle className="w-4 h-4 text-red-600" strokeWidth={1.5} /> : alert.level === "warning" ? <CalendarClock className="w-4 h-4 text-orange-600" strokeWidth={1.5} /> : <TrendingUp className="w-4 h-4 text-blue-600" strokeWidth={1.5} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{alert.title}</div>
                    <div className="text-xs text-gray-600 mt-0.5">{alert.message}</div>
                  </div>
                </div>
              ))}
              {!alerts.length && <div className="text-sm text-gray-500">Aucune alerte en cours</div>}
            </div>
            <button className="w-full mt-3 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">Voir toutes les alertes →</button>
          </div>

          <div className="bg-gradient-to-br from-[#0F3D3A] to-[#0D9488] rounded-xl p-6 text-white">
            <h3 className="text-base font-semibold mb-4">Statistiques rapides</h3>
            <div className="space-y-3">
              {quickStats.map((stat: QuickStat, idx: number) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-white/80">{stat.label}</span>
                  <span className="text-lg font-semibold">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module: QuickModule, idx: number) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">{module.icon}</div>
              <div>
                <h3 className="text-lg font-semibold">{module.title}</h3>
                <p className="text-xs text-gray-500">{module.subtitle}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              {module.stats.map((stat, statIdx: number) => (
                <div key={statIdx} className="flex items-center justify-between">
                  <span>{stat.label}</span>
                  <span className="font-semibold text-gray-900">{stat.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-2">
              {module.badges.map((badge, badgeIdx: number) => (
                <span key={badgeIdx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">{badge}</span>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Transactions récentes</h2>
            <button className="text-sm font-medium text-[#0D9488] hover:text-[#0B7C74] flex items-center gap-1">
              Voir tout
              <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
            </button>
          </div>
          <div className="space-y-3">
            {recentEntries.slice(0, 5).map((entry: DashboardEntry, idx: number) => (
              <div key={idx} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:border-[#0D9488] hover:bg-[#0D9488]/5 transition">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${entry.amount >= 0 ? "bg-green-50" : "bg-red-50"}`}>
                  {entry.amount >= 0 ? <ArrowDownLeft className="text-green-600 w-[18px] h-[18px]" /> : <ArrowUpRight className="text-red-600 w-[18px] h-[18px]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{entry.description}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{entry.type}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-semibold ${entry.amount >= 0 ? "text-green-600" : "text-red-600"}`}>{formatCurrency(entry.amount)}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{formatDate(entry.date)}</div>
                </div>
              </div>
            ))}
            {!recentEntries.length && <div className="text-sm text-gray-500">Aucune transaction récente</div>}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Tâches en attente</h2>
            <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">{tasks.length} actions</span>
          </div>
          <div className="space-y-3">
            {tasks.map((task: TaskItem, idx: number) => (
              <div key={idx} className="flex items-start gap-4 p-3 rounded-lg border border-gray-100 hover:border-[#0D9488] hover:bg-[#0D9488]/5 transition">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${task.level === "danger" ? "bg-red-50" : task.level === "warning" ? "bg-orange-50" : "bg-blue-50"}`}>
                  {task.level === "danger" ? <AlertCircle className="text-red-600 w-[18px] h-[18px]" /> : task.level === "warning" ? <AlertTriangle className="text-orange-500 w-[18px] h-[18px]" /> : <CheckCircle2 className="text-blue-500 w-[18px] h-[18px]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{task.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{task.message}</div>
                  <div className="flex items-center gap-2 mt-2">
                    {task.badge && (
                      <span className={`text-xs px-2 py-0.5 rounded ${task.level === "danger" ? "bg-red-50 text-red-600" : task.level === "warning" ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"}`}>{task.badge}</span>
                    )}
                    {task.deadline && <span className="text-xs text-gray-400">{task.deadline}</span>}
                  </div>
                </div>
              </div>
            ))}
            {!tasks.length && <div className="text-sm text-gray-500">Aucune tâche prioritaire</div>}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-8 text-white space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight mb-2">Solution ERP complète et intégrée</h2>
          <p className="text-gray-300">Tous les modules pour gérer votre comptabilité, trésorerie, facturation et fiscalité</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div className="space-y-2">
            {["Conformité RGPD", "ISO 27001", "SOC 2 Type II"].map((label, idx: number) => (
              <div key={`compliance-${idx}`} className="flex items-center gap-2 text-green-400">
                <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-blue-400">
            {["API Banking", "OCR + IA", "Lettrage auto"].map((label, idx: number) => (
              <div key={`tech-${idx}`} className="flex items-center gap-2">
                <Zap className="w-4 h-4" strokeWidth={1.5} />
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-purple-400">
            {["Multi-devises", "Multi-entités", "Multi-normes"].map((label, idx: number) => (
              <div key={`global-${idx}`} className="flex items-center gap-2">
                <Globe className="w-4 h-4" strokeWidth={1.5} />
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-orange-400">
            {["Apps mobiles", "Mode offline", "Scan factures"].map((label, idx: number) => (
              <div key={`mobile-${idx}`} className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" strokeWidth={1.5} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
