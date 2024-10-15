import { Language } from '@/common/types/language.enum';
import { Module } from '@nestjs/common';
import { HeaderResolver, I18nModule } from 'nestjs-i18n';
import { join } from 'path';

@Module({
	imports: [
		I18nModule.forRoot({
			fallbackLanguage: Language.EN,
			loaderOptions: {
				path: join(__dirname, '/trans/'),
				watch: true
			},
			resolvers: [new HeaderResolver(['x-lang'])],
			typesOutputPath: join(
				__dirname,
				'/../../../../src/module/i18n/generated/i18n.generated.ts'
			)
		})
	]
})
export class I18NModule {}
