CREATE DATABASE  IF NOT EXISTS `rs` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `rs`;
-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: rs
-- ------------------------------------------------------
-- Server version	8.4.0

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
-- Table structure for table `reserva`
--

DROP TABLE IF EXISTS `reserva`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reserva` (
  `id_reserva` int NOT NULL AUTO_INCREMENT,
  `fk_id_sala` int NOT NULL,
  `fk_id_usuario` int NOT NULL,
  `datahora_inicio` datetime NOT NULL,
  `datahora_fim` datetime NOT NULL,
  PRIMARY KEY (`id_reserva`),
  KEY `fk_id_sala` (`fk_id_sala`),
  KEY `fk_id_usuario` (`fk_id_usuario`),
  CONSTRAINT `reserva_ibfk_1` FOREIGN KEY (`fk_id_sala`) REFERENCES `sala` (`id_sala`),
  CONSTRAINT `reserva_ibfk_2` FOREIGN KEY (`fk_id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reserva`
--

LOCK TABLES `reserva` WRITE;
/*!40000 ALTER TABLE `reserva` DISABLE KEYS */;
INSERT INTO `reserva` VALUES (1,12,1,'2024-11-13 09:00:00','2024-11-13 12:00:00'),(2,19,2,'2024-11-13 14:00:00','2024-11-13 18:00:00'),(3,30,3,'2024-11-13 08:00:00','2024-11-13 12:00:00'),(4,21,4,'2024-11-13 13:00:00','2024-11-13 17:00:00'),(5,29,5,'2024-11-13 09:00:00','2024-11-13 13:00:00');
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
  `descricao` text,
  `bloco` varchar(255) NOT NULL,
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
INSERT INTO `sala` VALUES (1,'AMA - Automotiva','Alta Mogiana Automotiva','A','Oficina',16),(2,'AMS - Desenvolvimento','Alta Mogiana Desenvolvimento de Sistema','A','Sala',16),(3,'AME - Eletroeletrônica','Alta Mogiana Eletroeletrônica','A','Laboratório',16),(4,'AMM - Manutenção','Alta Mogiana Manutenção','A','Oficina',16),(5,'A2 - ELETRÔNICA','Laboratório de Eletrônica','A','Laboratório',16),(6,'A3 - CLP','Controladores Lógicos Programáveis','A','Laboratório',16),(7,'A4 - AUTOMAÇÃO','Sistemas de Automação','A','Laboratório',20),(8,'A5 - METROLOGIA','Instrumentos de Medição','A','Laboratório',16),(9,'A6 - PNEUMÁTICA','Equipamentos Pneumáticos e Hidráulicos','A','Laboratório',20),(10,'B2 - AULA','Sala de Aula','B','Sala',32),(11,'B3 - AULA','Sala de Aula','B','Sala',32),(12,'B5 - AULA','Sala de Aula','B','Sala',40),(13,'B6 - AULA','Sala de Aula','B','Sala',32),(14,'B7 - AULA','Sala de Aula','B','Sala',32),(15,'B8 - INFORMÁTICA','Laboratório de Informática','B','Laboratório',20),(16,'B9 - INFORMÁTICA','Estação de Trabalho','B','Laboratório',16),(17,'B10 - INFORMÁTICA','Computadores Programáveis','B','Laboratório',16),(18,'B11 - INFORMÁTICA','Equipamentos de Rede','B','Laboratório',40),(19,'B12 - INFORMÁTICA','Laboratório de TI','B','Laboratório',40),(20,'CA - Colorado A1','Sala Multimídia','C','Sala',16),(21,'COF - Colorado Oficina','Ferramentas Manuais','C','Oficina',16),(22,'C1 - AULA (ALP)','Sala de Aula (ALP)','C','Sala',24),(23,'C2 - INFORMATICA','Software Educacional','C','Laboratório',32),(24,'C3 - MODELAGEM','Máquinas de Costura','C','Oficina',20),(25,'C4 - MODELAGEM','Equipamentos de Modelagem','C','Oficina',20),(26,'C5 - AULA','Materiais Didáticos','C','Sala',16),(27,'D1 - MODELAGEM','Ferramentas de Modelagem','D','Oficina',16),(28,'D2 - MODELAGEM','Estações de Trabalho de Modelagem','D','Oficina',20),(29,'D3 - AULA','Quadro e Projetor','D','Sala',16),(30,'D4 - CRIAÇÃO','Materiais de Artesanato','D','Oficina',18),(31,'LAB - ALIMENTOS','Equipamentos de Cozinha','Lab','Laboratório',16),(32,'OFI - AJUSTAGEM/FRESAGEM','Máquinas de Fresagem','Oficina','Oficina',16),(33,'OFI - COMANDOS ELÉTRICOS','Circuitos Elétricos','Oficina','Oficina',16),(34,'OFI - TORNEARIA','Torno Mecânico','Oficina','Oficina',20),(35,'OFI - SOLDAGEM','Equipamentos de Solda','Oficina','Oficina',16),(36,'OFI - MARCENARIA','Ferramentas de Marcenaria','Oficina','Oficina',16),(37,'OFI - LIXAMENTO','Lixadeiras e Polidoras','Oficina','Oficina',16);
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
INSERT INTO `usuario` VALUES (1,'João Silva','joao.silva@example.com','3456789','senha123'),(2,'Maria Oliveira','maria.oliveira@example.com','7654321','senha123'),(3,'Carlos Pereira','carlos.pereira@example.com','3987456','senha123'),(4,'Ana Souza','ana.souza@example.com','6123789','senha123'),(5,'Pedro Costa','pedro.costa@example.com','9123456','senha123'),(6,'Laura Lima','laura.lima@example.com','1654987','senha123'),(7,'Lucas Alves','lucas.alves@example.com','4321987','senha123'),(8,'Fernanda Rocha','fernanda.rocha@example.com','1852963','senha123'),(9,'Rafael Martins','rafael.martins@example.com','9258147','senha123'),(10,'Juliana Nunes','juliana.nunes@example.com','8147369','senha123'),(11,'Paulo Araujo','paulo.araujo@example.com','9753486','senha123'),(12,'Beatriz Melo','beatriz.melo@example.com','6159753','senha123'),(13,'Renato Dias','renato.dias@example.com','3486159','senha123'),(14,'Camila Ribeiro','camila.ribeiro@example.com','3852741','senha123'),(15,'Thiago Teixeira','thiago.teixeira@example.com','2741963','senha123'),(16,'Patrícia Fernandes','patricia.fernandes@example.com','1963852','senha123'),(17,'Rodrigo Gomes','rodrigo.gomes@example.com','3741852','senha123'),(18,'Mariana Batista','mariana.batista@example.com','7258369','senha123'),(19,'Fábio Freitas','fabio.freitas@example.com','9147258','senha123'),(20,'Isabela Cardoso','isabela.cardoso@example.com','8369147','senha123');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'rs'
--

--
-- Dumping routines for database 'rs'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-26 20:22:00
