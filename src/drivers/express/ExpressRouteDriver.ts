import { ExpressResponder } from '../drivers';
import { DataStore, Responder } from '../../interfaces/interfaces';
import { Router, Response } from 'express';
import { SuggestionInteractor } from '../../interactors/interactors';
import { OutcomeFilter, suggestMode } from '../../interfaces/DataStore';

const threshold = parseFloat(process.env.CLARK_LO_SUGGESTION_THRESHOLD);
// tslint:disable-next-line:no-require-imports
const version = require('../../../package.json').version;

export class ExpressRouteDriver {
  constructor(private dataStore: DataStore) {}

  public static buildRouter(dataStore: DataStore): Router {
    let e = new ExpressRouteDriver(dataStore);
    let router: Router = Router();
    e.setRoutes(router);
    return router;
  }

  private getResponder(response: Response): Responder {
    return new ExpressResponder(response);
  }

  private setRoutes(router: Router): void {
    router.get('/', async (req, res) => {
      res.json({
        version,
        message: `Welcome to the Learning Outcome Suggestion' API v${version}`,
      });
    });

    router.get('/outcomes', async (req, res) => {
      try {
        let filter: OutcomeFilter = {
          text: req.query.text ? req.query.text : '',
          source: req.query.author,
          name: req.query.name,
          date: req.query.date,
        };
        let page = req.query.page ? +req.query.page : undefined;
        let limit = req.query.limit ? +req.query.limit : undefined;
        await SuggestionInteractor.searchOutcomes(
          this.dataStore,
          this.getResponder(res),
          filter,
          page,
          limit,
        );
      } catch (e) {
        console.log(e);
      }
    });

    router.get('/outcomes/suggest', async (req, res) => {
      try {
        const mode: suggestMode = 'text';
        const scoreThreshold: number = process.env.SUGGESTION_THRESHOLD
          ? +process.env.SUGGESTION_THRESHOLD
          : 0;
        let filter: OutcomeFilter = {
          text: req.query.text ? req.query.text : '',
          source: req.query.author,
          name: req.query.name,
          date: req.query.date,
        };
        let page = req.query.page ? +req.query.page : undefined;
        let limit = req.query.limit ? +req.query.limit : undefined;
        await SuggestionInteractor.suggestOutcomes(
          this.dataStore,
          this.getResponder(res),
          filter,
          mode,
          scoreThreshold,
          limit,
          page,
        );
      } catch (e) {
        console.log(e);
      }
    });

    router.get('/outcomes/sources', async (req, res) => {
      const responder = this.getResponder(res);
      try {
        const sources = await SuggestionInteractor.fetchSources(this.dataStore);
        responder.sendObject(sources);
      } catch (e) {
        console.error(e);
        responder.sendOperationError(e);
      }
    });
    router.get('/outcomes/areas', async (req, res) => {
      try {
        const areas = await SuggestionInteractor.fetchAreas(this.dataStore);
        res.json(areas);
      } catch (e) {
        res.send('Internal Server Error');
      }
    });
  }
}
