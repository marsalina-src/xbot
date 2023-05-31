import { ObjectId } from "mongoose";
import { Context, Scenes } from "telegraf";

interface customWizardSession extends Scenes.WizardSessionData {
    sentence_id: string,
    amount: number,
    active_translation: string,
    moderation_sentence: string,
    current_translation_for_vote: ObjectId,
    web: string,
    web2: string,
    coinQoute: any,
    sum: any,
    wallet: any,
    email: any,
    summary: any
}

interface customSession extends Scenes.WizardSession<customWizardSession> {
    sentences: string[];
    language: 'buryat-word' | 'russian-word';
}

interface customContext extends Context {
    session: customSession;
    scene: Scenes.SceneContextScene<customContext, customWizardSession>;
    wizard: Scenes.WizardContextWizard<customContext>,
    update: any,
    message: any
}

export default customContext