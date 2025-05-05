-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: rs
-- ------------------------------------------------------
-- Server version	8.0.36

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Temporary view structure for view `cru`
--

DROP TABLE IF EXISTS `cru`;
/*!50001 DROP VIEW IF EXISTS `cru`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `cru` AS SELECT 
 1 AS `id_usuario`,
 1 AS `nome`,
 1 AS `total_reservas`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `rd`
--

DROP TABLE IF EXISTS `rd`;
/*!50001 DROP VIEW IF EXISTS `rd`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `rd` AS SELECT 
 1 AS `id_reserva`,
 1 AS `data`,
 1 AS `dia_semana`,
 1 AS `hora_inicio`,
 1 AS `hora_fim`,
 1 AS `sala_id_sala`,
 1 AS `sala_nome`,
 1 AS `usuario_nome`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `reserva`
--

DROP TABLE IF EXISTS `reserva`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reserva` (
  `id_reserva` int NOT NULL AUTO_INCREMENT,
  `fk_id_sala` int NOT NULL,
  `fk_id_usuario` int NOT NULL,
  `dia_semana` varchar(20) NOT NULL,
  `data` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fim` time NOT NULL,
  PRIMARY KEY (`id_reserva`),
  KEY `fk_id_sala` (`fk_id_sala`),
  KEY `fk_id_usuario` (`fk_id_usuario`),
  KEY `idx_reserva_dia_semana` (`dia_semana`),
  KEY `idx_reserva_hora_inicio` (`hora_inicio`),
  KEY `idx_reserva_hora_fim` (`hora_fim`),
  CONSTRAINT `reserva_ibfk_1` FOREIGN KEY (`fk_id_sala`) REFERENCES `sala` (`id_sala`),
  CONSTRAINT `reserva_ibfk_2` FOREIGN KEY (`fk_id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reserva`
--

LOCK TABLES `reserva` WRITE;
/*!40000 ALTER TABLE `reserva` DISABLE KEYS */;
INSERT INTO `reserva` VALUES (1,1,1,'Quarta-Feira','2025-12-31','07:00:00','08:00:00'),(2,2,2,'Quarta-Feira','2025-12-31','08:00:00','09:00:00'),(3,3,3,'Quarta-Feira','2025-12-31','09:00:00','10:00:00'),(4,4,4,'Quarta-Feira','2025-12-31','10:00:00','11:00:00'),(5,5,5,'Quarta-Feira','2025-12-31','11:00:00','12:00:00'),(7,4,1,'Segunda-Feira','2025-05-05','12:00:00','13:00:00'),(8,1,1,'Quarta-Feira','2024-12-31','07:00:00','08:00:00');
/*!40000 ALTER TABLE `reserva` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sala`
--

DROP TABLE IF EXISTS `sala`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sala` (
  `id_sala` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `descricao` varchar(255) NOT NULL,
  `bloco` varchar(1) NOT NULL,
  `tipo` varchar(255) NOT NULL,
  `capacidade` int NOT NULL,
  PRIMARY KEY (`id_sala`),
  UNIQUE KEY `nome` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sala`
--

LOCK TABLES `sala` WRITE;
/*!40000 ALTER TABLE `sala` DISABLE KEYS */;
INSERT INTO `sala` VALUES (1,'AMA - Automotiva','Alta Mogiana Automotiva','A','Oficina',16),(2,'AMS - Desenvolvimento','Alta Mogiana Desenvolvimento de Sistema','A','Sala',16),(3,'AME - Eletroeletrônica','Alta Mogiana Eletroeletrônica','A','Laboratório',16),(4,'AMM - Manutenção','Alta Mogiana Manutenção','A','Oficina',16),(5,'A2 - ELETRÔNICA','Laboratório de Eletrônica','A','Laboratório',16),(6,'A3 - CLP','Controladores Lógicos Programáveis','A','Laboratório',16),(7,'A4 - AUTOMAÇÃO','Sistemas de Automação','A','Laboratório',20),(8,'A5 - METROLOGIA','Instrumentos de Medição','A','Laboratório',16),(9,'A6 - PNEUMÁTICA','Equipamentos Pneumáticos e Hidráulicos','A','Laboratório',20),(10,'B2 - AULA','Sala de Aula','B','Sala',32),(11,'B3 - AULA','Sala de Aula','B','Sala',32),(12,'B5 - AULA','Sala de Aula','B','Sala',40),(13,'B6 - AULA','Sala de Aula','B','Sala',32),(14,'B7 - AULA','Sala de Aula','B','Sala',32),(15,'B8 - INFORMÁTICA','Laboratório de Informática','B','Laboratório',20),(16,'B9 - INFORMÁTICA','Estação de Trabalho','B','Laboratório',16),(17,'B10 - INFORMÁTICA','Computadores Programáveis','B','Laboratório',16),(18,'B11 - INFORMÁTICA','Equipamentos de Rede','B','Laboratório',40),(19,'B12 - INFORMÁTICA','Laboratório de TI','B','Laboratório',40),(20,'CA - Colorado A1','Sala Multimídia','C','Sala',16),(21,'COF - Colorado Oficina','Ferramentas Manuais','C','Oficina',16),(22,'C1 - AULA (ALP)','Sala de Aula (ALP)','C','Sala',24),(23,'C2 - INFORMATICA','Software Educacional','C','Laboratório',32),(24,'C3 - MODELAGEM','Máquinas de Costura','C','Oficina',20),(25,'C4 - MODELAGEM','Equipamentos de Modelagem','C','Oficina',20),(26,'C5 - AULA','Materiais Didáticos','C','Sala',16),(27,'D1 - MODELAGEM','Ferramentas de Modelagem','D','Oficina',16),(28,'D2 - MODELAGEM','Estações de Trabalho de Modelagem','D','Oficina',20),(29,'D3 - AULA','Quadro e Projetor','D','Sala',16),(30,'D4 - CRIAÇÃO','Materiais de Artesanato','D','Oficina',18),(31,'LAB - ALIMENTOS','Equipamentos de Cozinha','L','Laboratório',16),(32,'OFI - AJUSTAGEM/FRESAGEM','Máquinas de Fresagem','O','Oficina',16),(33,'OFI - COMANDOS ELÉTRICOS','Circuitos Elétricos','O','Oficina',16),(34,'OFI - TORNEARIA','Torno Mecânico','O','Oficina',20),(35,'OFI - SOLDAGEM','Equipamentos de Solda','O','Oficina',16),(36,'OFI - MARCENARIA','Ferramentas de Marcenaria','O','Oficina',16),(37,'OFI - LIXAMENTO','Lixadeiras e Polidoras','O','Oficina',16);
/*!40000 ALTER TABLE `sala` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `NIF` char(7) NOT NULL,
  `senha` varchar(255) NOT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `NIF` (`NIF`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'João  Silva','joao.silva35@docente.senai.br','3456789','joao.6789'),(2,'Maria Oliveira','maria.oliveira@docente.senai.br','7654321','maria.4321'),(3,'Carlos Pereira','carlos.pereira@docente.senai.br','3987456','carlos.7456'),(4,'Ana Souza','ana.souza@docente.senai.br','6123789','ana.3789'),(5,'Pedro Costa','pedro.costa@docente.senai.br','9123456','pedro.3456'),(6,'Laura Lima','laura.lima@docente.senai.br','1654987','laura.4987'),(7,'Lucas Alves','lucas.alves@docente.senai.br','4321987','lucas.1987'),(8,'Fernanda Rocha','fernanda.rocha@docente.senai.br','1852963','fernanda.2963'),(9,'Rafael Martins','rafael.martins@docente.senai.br','9258147','rafael.8147'),(10,'Juliana Nunes','juliana.nunes@docente.senai.br','8147369','juliana.7369'),(11,'Paulo Araujo','paulo.araujo@docente.senai.br','9753486','paulo.3486'),(12,'Beatriz Melo','beatriz.melo@docente.senai.br','6159753','beatriz.9753'),(13,'Renato Dias','renato.dias@docente.senai.br','3486159','renato.6159'),(14,'Camila Ribeiro','camila.ribeiro@docente.senai.br','3852741','camila.2741'),(15,'Thiago Teixeira','thiago.teixeira@docente.senai.br','2741963','thiago.1963'),(16,'Patrícia Fernandes','patricia.fernandes@docente.senai.br','1963852','patricia.3852'),(17,'Rodrigo Gomes','rodrigo.gomes@docente.senai.br','3741852','rodrigo.1852'),(18,'Mariana Batista','mariana.batista@docente.senai.br','7258369','mariana.8369'),(19,'Fábio Freitas','fabio.freitas@docente.senai.br','9147258','fabio.7258'),(20,'Isabela Cardoso','isabela.cardoso@docente.senai.br','8369147','isabela.9147');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `cru`
--

/*!50001 DROP VIEW IF EXISTS `cru`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`alunods`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `cru` AS select `u`.`id_usuario` AS `id_usuario`,`u`.`nome` AS `nome`,count(`r`.`id_reserva`) AS `total_reservas` from (`usuario` `u` left join `reserva` `r` on((`u`.`id_usuario` = `r`.`fk_id_usuario`))) group by `u`.`id_usuario`,`u`.`nome` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `rd`
--

/*!50001 DROP VIEW IF EXISTS `rd`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`alunods`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `rd` AS select `r`.`id_reserva` AS `id_reserva`,`r`.`data` AS `data`,`r`.`dia_semana` AS `dia_semana`,`r`.`hora_inicio` AS `hora_inicio`,`r`.`hora_fim` AS `hora_fim`,`s`.`id_sala` AS `sala_id_sala`,`s`.`nome` AS `sala_nome`,`u`.`nome` AS `usuario_nome` from ((`reserva` `r` join `sala` `s` on((`r`.`fk_id_sala` = `s`.`id_sala`))) join `usuario` `u` on((`r`.`fk_id_usuario` = `u`.`id_usuario`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-05  8:59:47
